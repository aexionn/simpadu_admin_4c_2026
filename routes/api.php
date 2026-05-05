<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix("/auth")->group(function () {
    Route::post("/register", [AuthController::class, "register"]);
    Route::post("/login", [AuthController::class, "login"]);
    Route::post("/refresh", [AuthController::class, "refresh"]);
});

Route::middleware("auth:jwt")->group(function () {
    Route::post("/auth/logout", [AuthController::class, "logout"]);
    Route::get("/auth/me", [AuthController::class, "me"]);
});