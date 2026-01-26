<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\EscrowTransaction;
use App\Models\PlatformSetting;
use App\Models\RefundRequest;
use App\Models\Marketplace\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminFinanceController extends Controller
{
    public function refundRequests(Request $request)
    {
        $query = RefundRequest::with(['order', 'requestedBy', 'processedBy']);

        if ($request->filled('status')) {
            $request->validate(['status' => 'in:requested,approved,rejected,processed']);
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function createRefundRequest(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
        ]);

        $refund = RefundRequest::create([
            'order_id' => $validated['order_id'],
            'requested_by_user_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'USD',
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'requested',
        ]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'refund.requested',
            'entity_type' => 'refund_request',
            'entity_id' => $refund->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Refund request created successfully', 'refund' => $refund], 201);
    }

    public function updateRefundStatus(Request $request, $id)
    {
        $refund = RefundRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:requested,approved,rejected,processed',
            'details' => 'nullable|string',
        ]);

        $refund->status = $validated['status'];
        if (array_key_exists('details', $validated)) {
            $refund->details = $validated['details'];
        }

        if (in_array($validated['status'], ['approved', 'rejected', 'processed'], true)) {
            $refund->processed_by_admin_id = $request->user()->id;
            $refund->processed_at = now();
        }

        $refund->save();

        if ($validated['status'] === 'processed') {
            EscrowTransaction::create([
                'order_id' => $refund->order_id,
                'seller_id' => $refund->order->seller_id,
                'amount' => $refund->amount,
                'currency' => $refund->currency,
                'type' => 'refund',
                'status' => 'completed',
                'notes' => 'Refund processed via admin',
                'processed_by_admin_id' => $request->user()->id,
            ]);
        }

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'refund.status_updated',
            'entity_type' => 'refund_request',
            'entity_id' => $refund->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Refund updated successfully', 'refund' => $refund->load(['order', 'requestedBy', 'processedBy'])]);
    }

    public function escrow(Request $request)
    {
        $query = EscrowTransaction::with(['order', 'seller', 'processedBy']);

        if ($request->filled('type')) {
            $request->validate(['type' => 'in:hold,release,refund']);
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function releaseEscrow(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $txn = EscrowTransaction::create([
            'order_id' => $order->id,
            'seller_id' => $order->seller_id,
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? $order->currency,
            'type' => 'release',
            'status' => 'completed',
            'notes' => $validated['notes'] ?? 'Escrow release via admin',
            'processed_by_admin_id' => $request->user()->id,
        ]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'escrow.released',
            'entity_type' => 'escrow_transaction',
            'entity_id' => $txn->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Escrow released successfully', 'transaction' => $txn], 201);
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $from = $validated['from'] ?? now()->subDays(30)->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $orders = Order::whereBetween('created_at', [$from, $to]);

        $totalRevenue = (clone $orders)->where('payment_status', 'completed')->sum('total');
        $ordersCount = (clone $orders)->count();

        $commissionRateRow = PlatformSetting::where('key', 'commission_rate')->first();
        $commissionRate = $commissionRateRow ? (float) $commissionRateRow->value : 0.05;

        $estimatedCommission = $totalRevenue * $commissionRate;

        $payoutsTotal = DB::table('payouts')->whereBetween('created_at', [$from, $to])->sum('amount');

        return response()->json([
            'range' => ['from' => $from, 'to' => $to],
            'orders_count' => $ordersCount,
            'revenue_total' => (float) $totalRevenue,
            'commission_rate' => $commissionRate,
            'estimated_commission_total' => (float) $estimatedCommission,
            'payouts_total' => (float) $payoutsTotal,
        ]);
    }

    public function revenueTrend(Request $request)
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $days = (int) ($validated['days'] ?? 30);

        $rows = Order::selectRaw("date(created_at) as day, sum(total) as revenue")
            ->where('payment_status', 'completed')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy(DB::raw('date(created_at)'))
            ->orderBy(DB::raw('date(created_at)'))
            ->get();

        return response()->json([
            'days' => $days,
            'points' => $rows,
        ]);
    }
}
