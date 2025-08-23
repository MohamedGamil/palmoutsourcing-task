<?php

use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// User routes (authenticated)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [UserController::class, 'me']);
    Route::get('/user/profile', [UserController::class, 'profile']);
});

// Task API routes
Route::apiResource('tasks', TaskController::class);

// Additional task routes with authentication (if needed later)
// Route::middleware(['auth:sanctum'])->group(function () {
//     Route::apiResource('tasks', TaskController::class);
// });
