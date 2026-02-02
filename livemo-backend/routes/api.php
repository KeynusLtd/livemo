<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AlertActionController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BreedingRecordController;
use App\Http\Controllers\Api\FeedScheduleController;
use App\Http\Controllers\Api\FarmController;
use App\Http\Controllers\Api\FarmInsightsController;
use App\Http\Controllers\Api\FarmReportsController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\PastureController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\SensorReadingController;
use App\Http\Controllers\Api\FarmListingController;
use App\Http\Controllers\Api\FarmOrderController;
use App\Http\Controllers\Api\FarmExportController;
use App\Http\Controllers\Api\FarmProductController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminHealthController;
use App\Http\Controllers\Api\AdminPayoutController;
use App\Http\Controllers\Api\AdminAuditLogController;
use App\Http\Controllers\Api\AdminListingReportController;
use App\Http\Controllers\Api\AdminDisputeController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminListingController;
use App\Http\Controllers\Api\AdminAnnouncementController;
use App\Http\Controllers\Api\AdminContentPageController;
use App\Http\Controllers\Api\AdminFooterContentController;
use App\Http\Controllers\Api\AdminFinanceController;
use App\Http\Controllers\Api\Marketplace\SellerInsightsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Broadcasting auth (for private channels)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('/broadcasting/auth', function (Request $request) {
        $channelName = $request->input('channel_name');
        // For farm.{id} channels, ensure user owns the farm
        if (str_starts_with($channelName, 'farm.')) {
            $farmId = (int) str_replace('farm.', '', $channelName);
            $farm = \App\Models\Farm::find($farmId);
            if (!$farm || $farm->user_id !== $request->user()->id) {
                abort(403);
            }
        }
        return response()->json(['auth' => true]);
    });
});

// Protected routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Farms
    Route::apiResource('farms', FarmController::class);
    Route::get('/farms/{farm}/animals', [FarmController::class, 'animals']);
    Route::get('/farms/{farm}/dashboard', [FarmController::class, 'dashboard']);

    // Farm Operations (Feed / Pasture / Breeding)
    Route::get('/farms/{farm}/feed-schedules', [FeedScheduleController::class, 'index']);
    Route::post('/farms/{farm}/feed-schedules', [FeedScheduleController::class, 'store']);
    Route::get('/farms/{farm}/feed-schedules/{feedSchedule}', [FeedScheduleController::class, 'show']);
    Route::put('/farms/{farm}/feed-schedules/{feedSchedule}', [FeedScheduleController::class, 'update']);
    Route::delete('/farms/{farm}/feed-schedules/{feedSchedule}', [FeedScheduleController::class, 'destroy']);
    Route::post('/farms/{farm}/feed-schedules/{feedSchedule}/complete', [FeedScheduleController::class, 'complete']);

    Route::get('/farms/{farm}/pastures', [PastureController::class, 'index']);
    Route::post('/farms/{farm}/pastures', [PastureController::class, 'store']);
    Route::get('/farms/{farm}/pastures/{pasture}', [PastureController::class, 'show']);
    Route::put('/farms/{farm}/pastures/{pasture}', [PastureController::class, 'update']);
    Route::delete('/farms/{farm}/pastures/{pasture}', [PastureController::class, 'destroy']);
    Route::post('/farms/{farm}/pastures/{pasture}/assign-animal', [PastureController::class, 'assignAnimal']);
    Route::post('/farms/{farm}/pastures/{pasture}/remove-animal', [PastureController::class, 'removeAnimal']);

    Route::get('/farms/{farm}/breeding-records', [BreedingRecordController::class, 'index']);
    Route::post('/farms/{farm}/breeding-records', [BreedingRecordController::class, 'store']);
    Route::get('/farms/{farm}/breeding-records/{breedingRecord}', [BreedingRecordController::class, 'show']);
    Route::put('/farms/{farm}/breeding-records/{breedingRecord}', [BreedingRecordController::class, 'update']);
    Route::delete('/farms/{farm}/breeding-records/{breedingRecord}', [BreedingRecordController::class, 'destroy']);
    Route::get('/farms/{farm}/breeding-reminders', [BreedingRecordController::class, 'reminders']);

    // Farm Insights (Premium Intelligence - rule-based MVP)
    Route::get('/farms/{farm}/insights/health-score', [FarmInsightsController::class, 'healthScore']);
    Route::get('/farms/{farm}/insights/risk-signals', [FarmInsightsController::class, 'riskSignals']);
    Route::get('/farms/{farm}/insights/alert-patterns', [FarmInsightsController::class, 'alertPatterns']);

    // Farm Reports (export-ready JSON; CSV/PDF later)
    Route::get('/farms/{farm}/reports/health', [FarmReportsController::class, 'health']);
    Route::get('/farms/{farm}/reports/operations', [FarmReportsController::class, 'operations']);
    Route::get('/farms/{farm}/reports/financial', [FarmReportsController::class, 'financial']);

    // Farm Marketplace Listings (farmer-facing, farm-scoped)
    Route::get('/farms/{farm}/listings', [FarmListingController::class, 'index']);
    Route::post('/farms/{farm}/listings', [FarmListingController::class, 'store']);
    Route::get('/farms/{farm}/listings/{listing}', [FarmListingController::class, 'show']);
    Route::put('/farms/{farm}/listings/{listing}', [FarmListingController::class, 'update']);
    Route::delete('/farms/{farm}/listings/{listing}', [FarmListingController::class, 'destroy']);

    // Farm Orders & Earnings (seller cockpit, farm-scoped)
    Route::get('/farms/{farm}/orders', [FarmOrderController::class, 'index']);
    Route::get('/farms/{farm}/orders/{order}', [FarmOrderController::class, 'show']);
    Route::get('/farms/{farm}/earnings', [FarmOrderController::class, 'earnings']);

    // Farm Exports (CSV/JSON)
    Route::get('/farms/{farm}/export/health', [FarmExportController::class, 'health']);
    Route::get('/farms/{farm}/export/operations', [FarmExportController::class, 'operations']);
    Route::get('/farms/{farm}/export/financial', [FarmExportController::class, 'financial']);

    // Farm Product Inventory (farmer-side, not livestock)
    Route::get('/farms/{farm}/products', [FarmProductController::class, 'index']);
    Route::post('/farms/{farm}/products', [FarmProductController::class, 'store']);
    Route::get('/farms/{farm}/products/{product}', [FarmProductController::class, 'show']);
    Route::put('/farms/{farm}/products/{product}', [FarmProductController::class, 'update']);
    Route::delete('/farms/{farm}/products/{product}', [FarmProductController::class, 'destroy']);

    // Animals
    Route::apiResource('animals', AnimalController::class);
    Route::get('/animals/{animal}/health', [AnimalController::class, 'health']);
    Route::get('/animals/{animal}/timeline', [AnimalController::class, 'timeline']);

    // Health Records
    Route::apiResource('health-records', HealthController::class);
    Route::get('/health/analytics', [HealthController::class, 'analytics']);

    // Sensors
    Route::apiResource('sensors', SensorController::class);
    Route::post('/sensors/{sensor}/data', [SensorController::class, 'data']);
    Route::get('/sensors/{sensor}/readings', [SensorReadingController::class, 'index']);

    // Alerts
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::get('/alerts/{alert}', [AlertController::class, 'show']);
    Route::get('/alerts/{alert}/actions', [AlertActionController::class, 'index']);
    Route::post('/alerts/{alert}/actions', [AlertActionController::class, 'store']);
    Route::put('/alerts/{alert}/acknowledge', [AlertController::class, 'acknowledge']);
    Route::put('/alerts/{alert}/resolve', [AlertController::class, 'resolve']);
    Route::get('/alerts/stats', [AlertController::class, 'stats']);

    // Marketplace Seller Insights (seller cockpit)
    Route::get('/marketplace/seller/insights/summary', [SellerInsightsController::class, 'summary']);
    Route::get('/marketplace/seller/insights/revenue-trend', [SellerInsightsController::class, 'revenueTrend']);

    // Admin Routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}/status', [AdminController::class, 'updateUserStatus']);
        Route::get('/listings', [AdminController::class, 'listings']);
        Route::put('/listings/{id}/status', [AdminController::class, 'updateListingStatus']);
        Route::get('/transactions', [AdminController::class, 'transactions']);
        Route::get('/settings', [AdminController::class, 'settings']);
        Route::put('/settings', [AdminController::class, 'updateSettings']);

        // Categories
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

        // Payouts
        Route::get('/payouts', [AdminPayoutController::class, 'index']);
        Route::post('/payouts', [AdminPayoutController::class, 'store']);
        Route::put('/payouts/{id}/status', [AdminPayoutController::class, 'updateStatus']);

        // System Health
        Route::get('/health', [AdminHealthController::class, 'show']);

        // Audit Logs
        Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);

        // Listing Reports
        Route::get('/reports/listings', [AdminListingReportController::class, 'index']);
        Route::post('/reports/listings', [AdminListingReportController::class, 'store']);
        Route::put('/reports/listings/{id}', [AdminListingReportController::class, 'update']);

        // Disputes
        Route::get('/disputes', [AdminDisputeController::class, 'index']);
        Route::put('/disputes/{id}', [AdminDisputeController::class, 'update']);

        // User Admin Actions
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
        Route::get('/users/{id}/activity', [AdminUserController::class, 'activity']);

        // Listing Admin Actions
        Route::delete('/listings/{id}', [AdminListingController::class, 'destroy']);
        Route::put('/listings/{id}/feature', [AdminListingController::class, 'feature']);

        // CMS-lite
        Route::get('/announcements', [AdminAnnouncementController::class, 'index']);
        Route::post('/announcements', [AdminAnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [AdminAnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [AdminAnnouncementController::class, 'destroy']);

        Route::get('/content-pages', [AdminContentPageController::class, 'index']);
        Route::get('/content-pages/{slug}', [AdminContentPageController::class, 'show']);
        Route::post('/content-pages', [AdminContentPageController::class, 'store']);
        Route::put('/content-pages/{id}', [AdminContentPageController::class, 'update']);
        Route::delete('/content-pages/{id}', [AdminContentPageController::class, 'destroy']);

        Route::get('/footer-contents', [AdminFooterContentController::class, 'index']);
        Route::post('/footer-contents', [AdminFooterContentController::class, 'store']);
        Route::put('/footer-contents/{id}', [AdminFooterContentController::class, 'update']);
        Route::delete('/footer-contents/{id}', [AdminFooterContentController::class, 'destroy']);

        // Finance / Escrow / Refunds / Reporting
        Route::get('/finance/summary', [AdminFinanceController::class, 'summary']);
        Route::get('/finance/revenue-trend', [AdminFinanceController::class, 'revenueTrend']);

        Route::get('/finance/refunds', [AdminFinanceController::class, 'refundRequests']);
        Route::post('/finance/refunds', [AdminFinanceController::class, 'createRefundRequest']);
        Route::put('/finance/refunds/{id}/status', [AdminFinanceController::class, 'updateRefundStatus']);

        Route::get('/finance/escrow', [AdminFinanceController::class, 'escrow']);
        Route::post('/finance/escrow/release', [AdminFinanceController::class, 'releaseEscrow']);
    });
});

// Marketplace Public Routes
Route::prefix('v1/marketplace')->group(function () {
    // Browse listings
    Route::get('/listings', [\App\Http\Controllers\Api\Marketplace\MarketplaceListingController::class, 'index']);
    Route::get('/listings/{listing}', [\App\Http\Controllers\Api\Marketplace\MarketplaceListingController::class, 'show']);
    
    // Livestock
    Route::get('/livestock', [\App\Http\Controllers\Api\Marketplace\LivestockController::class, 'index']);
    Route::get('/livestock/{id}', [\App\Http\Controllers\Api\Marketplace\LivestockController::class, 'show']);
    
    // Reviews (public viewing)
    Route::get('/reviews', [\App\Http\Controllers\Api\Marketplace\ReviewController::class, 'index']);
});

// Marketplace Authenticated Routes
Route::prefix('v1/marketplace')->middleware('auth:sanctum')->group(function () {
    // Listings management (sellers)
    Route::post('/listings', [\App\Http\Controllers\Api\Marketplace\MarketplaceListingController::class, 'store']);
    Route::put('/listings/{listing}', [\App\Http\Controllers\Api\Marketplace\MarketplaceListingController::class, 'update']);
    Route::delete('/listings/{listing}', [\App\Http\Controllers\Api\Marketplace\MarketplaceListingController::class, 'destroy']);
    
    // Shopping Cart
    Route::get('/cart', [\App\Http\Controllers\Api\Marketplace\CartController::class, 'index']);
    Route::post('/cart', [\App\Http\Controllers\Api\Marketplace\CartController::class, 'store']);
    Route::put('/cart/{item}', [\App\Http\Controllers\Api\Marketplace\CartController::class, 'update']);
    Route::delete('/cart/{item}', [\App\Http\Controllers\Api\Marketplace\CartController::class, 'destroy']);
    Route::delete('/cart', [\App\Http\Controllers\Api\Marketplace\CartController::class, 'clear']);
    
    // Checkout
    Route::post('/checkout/initiate', [\App\Http\Controllers\Api\Marketplace\CheckoutController::class, 'initiate']);
    Route::post('/checkout/payment-intent', [\App\Http\Controllers\Api\Marketplace\CheckoutController::class, 'createPaymentIntent']);
    Route::post('/checkout/confirm', [\App\Http\Controllers\Api\Marketplace\CheckoutController::class, 'confirm']);
    
    // Orders
    Route::get('/orders', [\App\Http\Controllers\Api\Marketplace\OrderController::class, 'index']);
    Route::get('/orders/{order}', [\App\Http\Controllers\Api\Marketplace\OrderController::class, 'show']);
    Route::put('/orders/{order}/status', [\App\Http\Controllers\Api\Marketplace\OrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/cancel', [\App\Http\Controllers\Api\Marketplace\OrderController::class, 'cancel']);
    
    // Reviews
    Route::post('/reviews', [\App\Http\Controllers\Api\Marketplace\ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [\App\Http\Controllers\Api\Marketplace\ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [\App\Http\Controllers\Api\Marketplace\ReviewController::class, 'destroy']);
    Route::post('/reviews/{review}/respond', [\App\Http\Controllers\Api\Marketplace\ReviewController::class, 'respond']);
    Route::post('/reviews/{review}/helpful', [\App\Http\Controllers\Api\Marketplace\ReviewController::class, 'markHelpful']);
    
    // Messaging
    Route::get('/conversations', [\App\Http\Controllers\Api\Marketplace\MessageController::class, 'index']);
    Route::get('/conversations/{conversation}', [\App\Http\Controllers\Api\Marketplace\MessageController::class, 'show']);
    Route::post('/conversations', [\App\Http\Controllers\Api\Marketplace\MessageController::class, 'store']);
    Route::post('/conversations/{conversation}/messages', [\App\Http\Controllers\Api\Marketplace\MessageController::class, 'sendMessage']);
    Route::put('/conversations/{conversation}/read', [\App\Http\Controllers\Api\Marketplace\MessageController::class, 'markAsRead']);
});

// Marketplace Webhook (no auth)
Route::post('/v1/marketplace/webhook/stripe', [\App\Http\Controllers\Api\Marketplace\CheckoutController::class, 'webhook']);
