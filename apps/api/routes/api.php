<?php

use App\Http\Controllers\Api\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/**
 * @OA\Get(
 *     path="/user",
 *     summary="Get authenticated user",
 *     description="Returns the authenticated user's information.",
 *     tags={"User"},
 *     security={{"sanctum":{}}},
 *     @OA\Response(
 *         response=200,
 *         description="Authenticated user data",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="id", type="integer"),
 *             @OA\Property(property="name", type="string"),
 *             @OA\Property(property="email", type="string")
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthenticated"
 *     )
 * )
 */
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Task API routes
Route::apiResource('tasks', TaskController::class);

// Additional task routes with authentication (if needed later)
// Route::middleware(['auth:sanctum'])->group(function () {
//     Route::apiResource('tasks', TaskController::class);
// });
