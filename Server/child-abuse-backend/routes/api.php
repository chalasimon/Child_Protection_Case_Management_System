<?php

use Illuminate\Support\Facades\Route;

// Simple test route
Route::get('/', function () {
    return response()->json([
        'message' => 'Child Abuse Case Management System API',
        'status' => 'running',
        'version' => '1.0.0',
        'endpoints' => [
            'POST /api/login' => 'User login',
            'GET /api/dashboard/stats' => 'Dashboard statistics',
            'GET /api/cases' => 'List cases',
            'POST /api/cases' => 'Create case'
        ]
    ]);
});

// Include the main API routes
require __DIR__ . '/api-v1.php';
