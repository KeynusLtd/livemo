<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FarmController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\AdminController;
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

    // Alerts
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::get('/alerts/{alert}', [AlertController::class, 'show']);
    Route::put('/alerts/{alert}/acknowledge', [AlertController::class, 'acknowledge']);
    Route::put('/alerts/{alert}/resolve', [AlertController::class, 'resolve']);
    Route::get('/alerts/stats', [AlertController::class, 'stats']);

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
