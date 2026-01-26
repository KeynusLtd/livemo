<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Marketplace\Conversation;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\Order;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'user.deleted',
            'entity_type' => 'user',
            'entity_id' => $id,
            'metadata' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function activity(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $listings = Listing::where('seller_id', $user->id)->latest()->take(10)->get();
        $purchases = Order::where('buyer_id', $user->id)->latest()->take(10)->get();
        $sales = Order::where('seller_id', $user->id)->latest()->take(10)->get();

        $conversations = Conversation::with(['listing'])
            ->forUser($user->id)
            ->orderBy('last_message_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'user' => $user,
            'recent' => [
                'listings' => $listings,
                'purchases' => $purchases,
                'sales' => $sales,
                'conversations' => $conversations,
            ],
            'counts' => [
                'listings' => Listing::where('seller_id', $user->id)->count(),
                'purchases' => Order::where('buyer_id', $user->id)->count(),
                'sales' => Order::where('seller_id', $user->id)->count(),
                'conversations' => Conversation::forUser($user->id)->count(),
            ],
        ]);
    }
}
