<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\DataMaster\KurikulumController;
use App\Http\Controllers\Api\DataMaster\MataKuliahController;
use App\Http\Controllers\Api\DataMaster\ProgramKelasController;
use App\Http\Controllers\Api\DataMaster\TahunAkademikController;
// ← ProdiSyncController import removed
use Illuminate\Support\Facades\Route;

// ── Public ────────────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',   [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

// ── Authenticated ─────────────────────────────────────────────────────────────
Route::middleware('auth:jwt')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('profile')->group(function () {
        Route::get('/',                  [ProfileController::class, 'show']);
        Route::patch('/',                [ProfileController::class, 'update']);
        Route::patch('/change-password', [ProfileController::class, 'changePassword']);
    });

    // ── Super Admin only ───────────────────────────────────────────────────────
    Route::middleware('role:super_admin')->prefix('admin')->group(function () {
        Route::post('/users',              [UserManagementController::class, 'register']);
        Route::get('/users',               [UserManagementController::class, 'index']);
        Route::patch('/users/{id}/toggle', [UserManagementController::class, 'toggleActive']);
        Route::delete('/users/{id}',       [UserManagementController::class, 'destroy']);

        Route::get('/roles',               [RoleController::class, 'index']);
        Route::post('/roles',              [RoleController::class, 'store']);
        Route::post('/users/{id}/roles',   [RoleController::class, 'assignToUser']);
        Route::delete('/users/{id}/roles', [RoleController::class, 'revokeFromUser']);
    });

    // ── Data Master (super_admin + admin_akademik) ─────────────────────────────
    Route::middleware('role:super_admin,admin_akademik')
        ->prefix('data-master')
        ->group(function () {
            Route::apiResource('program-kelas',  ProgramKelasController::class)
                ->parameters(['program-kelas' => 'id']);

            Route::apiResource('mata-kuliah', MataKuliahController::class)
                ->parameters(['mata-kuliah' => 'id']);

            Route::apiResource('tahun-akademik', TahunAkademikController::class)
                ->parameters(['tahun-akademik' => 'id']);

            Route::apiResource('kurikulum', KurikulumController::class)
                ->parameters(['kurikulum' => 'id']);

            // ← prodi/sync and prodi/sync-range routes removed
        });
});