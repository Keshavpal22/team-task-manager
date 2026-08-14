<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectMemberController;
use App\Http\Controllers\Api\TaskController;

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [AuthController::class, 'me']);

        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/admin-test', function () {
            return response()->json([
                'message' => 'Admin access granted!',
            ]);
        })->middleware('admin');
    });
});

/*
|--------------------------------------------------------------------------
| Project Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('projects', ProjectController::class);

    Route::get(
        '/team/members',
        [ProjectMemberController::class, 'availableMembers']
    );

    Route::get(
        '/projects/{project}/members',
        [ProjectMemberController::class, 'index']
    );

    Route::post(
        '/projects/{project}/members',
        [ProjectMemberController::class, 'store']
    )->middleware('admin');

    Route::delete(
        '/projects/{project}/members/{user}',
        [ProjectMemberController::class, 'destroy']
    )->middleware('admin');

});

Route::middleware('auth:sanctum')->group(function () {

    // Task listing/viewing
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);

    // Task creation/deletion - Admin only
    Route::post('/tasks', [TaskController::class, 'store'])
        ->middleware('admin');

    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])
        ->middleware('admin');

    // Update
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::patch('/tasks/{task}', [TaskController::class, 'update']);
});
