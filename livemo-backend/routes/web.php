<?php
// Empty web routes file
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return [
        'message' => 'Livemo Backend API is running!',
        'documentation' => '/api/documentation',
        'status' => 'healthy'
    ];
});
