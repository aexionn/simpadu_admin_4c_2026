<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix("/auth")->group(function () {
    Route::post("/login", [AuthController::class, "login"]);
    Route::post("/refresh", [AuthController::class, "refresh"]);
});
    
Route::middleware("auth:jwt")->group(function () {
    Route::post("/auth/logout", [AuthController::class, "logout"]);

    Route::prefix("profile")->group(function () {
        Route::get("/", [ProfileController::class, "show"]);
        Route::patch("/change-email", [ProfileController::class, "changeEmail"]);
        Route::patch("/change-password", [ProfileController::class, "changePassword"]);
    });

    Route::middleware('super_admin')->prefix('admin')->group(function (){
        Route::post("/users", [UserManagementController::class, "register"]);
        Route::get("/users", [UserManagementController::class, "index"]);
        Route::patch("/users/{id}/toggle", [UserManagementController::class, "toggleActiveStatus"]);
        Route::delete("/users/{id}", [UserManagementController::class, "destroy"]);

        Route::get("/roles", [RoleController::class, "index"]);
        Route::post("/roles", [RoleController::class, "store"]);
        Route::post("/roles/{id}/assign", [RoleController::class, "assignToUser"]);
        Route::post("/roles/{id}/revoke", [RoleController::class, "revokeFromUser"]);
    });
});