<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Controllers
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CaseController;
use App\Http\Controllers\Api\VictimController;
use App\Http\Controllers\Api\PerpetratorController;
use App\Http\Controllers\Api\ChildController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| Health Check (Public)
|--------------------------------------------------------------------------
*/
Route::get('/health', function () {
    try {
        $tables = DB::select('SHOW TABLES');

        return response()->json([
            'status' => 'healthy',
            'message' => 'Child Abuse Case Management System API',
            'database' => 'connected',
            'tables_count' => count($tables),
            'timestamp' => now(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    /*
    |------------------------ Auth ------------------------
    */
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    /*
    |--------------------- Dashboard ----------------------
    */
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'getStats']);
    });

    /*
    |----------------------- Cases ------------------------
    */
    Route::prefix('cases')->group(function () {
        Route::get('/', [CaseController::class, 'index']);
        Route::post('/', [CaseController::class, 'store']);
        Route::get('/{id}', [CaseController::class, 'show']);
        Route::put('/{id}', [CaseController::class, 'update']);
        Route::delete('/{id}', [CaseController::class, 'destroy']);
        Route::post('/{id}/notes', [CaseController::class, 'addNote']);
    });

    /*
    |----------------------- Victims ----------------------
    */
    Route::prefix('victims')->group(function () {
        Route::get('/', [VictimController::class, 'index']);
        Route::post('/', [VictimController::class, 'store']);
        Route::get('/{id}', [VictimController::class, 'show']);
        Route::put('/{id}', [VictimController::class, 'update']);
        Route::delete('/{id}', [VictimController::class, 'destroy']);
    });

    /*
    |--------------------- Perpetrators -------------------
    */
    Route::prefix('perpetrators')->group(function () {
        Route::get('/', [PerpetratorController::class, 'index']);
        Route::get('/search', [PerpetratorController::class, 'search']);
        Route::post('/', [PerpetratorController::class, 'store']);
        Route::get('/{id}', [PerpetratorController::class, 'show']);
        Route::put('/{id}', [PerpetratorController::class, 'update']);
        Route::delete('/{id}', [PerpetratorController::class, 'destroy']);
    });

    /*
    |----------------------- Children ----------------------
    */
    Route::prefix('children')->group(function () {
        Route::get('/', [ChildController::class, 'index']);
        Route::post('/', [ChildController::class, 'store']);
        Route::get('/{id}', [ChildController::class, 'show']);
        Route::put('/{id}', [ChildController::class, 'update']);
        Route::delete('/{id}', [ChildController::class, 'destroy']);
    });

    /*
    |---------------------- Incidents ----------------------
    */
    Route::prefix('incidents')->group(function () {
        Route::get('/', [IncidentController::class, 'index']);
        Route::post('/', [IncidentController::class, 'store']);
        Route::get('/{id}', [IncidentController::class, 'show']);
        Route::put('/{id}', [IncidentController::class, 'update']);
        Route::delete('/{id}', [IncidentController::class, 'destroy']);

        // ⭐⭐⭐ New Routes for Attachments ⭐⭐⭐
        Route::post('/{id}/attachments', [IncidentController::class, 'uploadAttachments']);
        Route::delete('/{id}/attachments', [IncidentController::class, 'removeAttachment']);
        Route::get('/{id}/attachments/download', [IncidentController::class, 'downloadAttachment']);
    });

    /*
    |------------------------ Users ------------------------
    */
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });

    /*
    |----------------------- Reports -----------------------
    */
    Route::prefix('reports')->group(function () {
        Route::get('/cases', [ReportController::class, 'casesReport']);
        Route::get('/victims', [ReportController::class, 'victimsReport']);
        Route::get('/perpetrators', [ReportController::class, 'perpetratorsReport']);
    });
});
