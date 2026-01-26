<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminHealthController extends Controller
{
    public function show(Request $request)
    {
        $dbOk = true;
        $dbError = null;

        try {
            DB::select('select 1');
        } catch (\Throwable $e) {
            $dbOk = false;
            $dbError = $e->getMessage();
        }

        return response()->json([
            'status' => ($dbOk ? 'ok' : 'degraded'),
            'timestamp' => now(),
            'database' => [
                'ok' => $dbOk,
                'error' => $dbError,
            ],
        ]);
    }
}
