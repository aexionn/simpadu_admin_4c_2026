<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::prefix("/auth")->group(function () {
    Route::post("/login", [AuthController::class, "login"]);
    Route::post("/refresh", [AuthController::class, "refresh"]);
});
    
Route::middleware("auth:jwt")->group(function () {
    Route::post("/auth/logout", [AuthController::class, "logout"]);
    Route::get("/auth/me", [AuthController::class, "me"]);

    Route::middleware('super_admin')->prefix('admin')->group(function (){
        Route::post("/users", [UserManagementController::class, "register"]);
        Route::get("/users", [UserManagementController::class, "index"]);
        Route::patch("/users/{id}/toggle", [UserManagementController::class, "toggleActiveStatus"]);
        // Route::put("/users/{id}", [UserManagementController::class, "update"]);
        Route::delete("/users/{id}", [UserManagementController::class, "destroy"]);
    });
});