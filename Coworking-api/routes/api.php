<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SpaceController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SpaceImageController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
// Routes publiques — visibles sans connexion
Route::get('/public/spaces',     [SpaceController::class, 'index']);
Route::get('/public/spaces/{space}', [SpaceController::class, 'show']);
Route::get('/public/equipments', [EquipmentController::class, 'index']);
// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::get('/profile',         [ProfileController::class, 'show']);
    Route::put('/profile',         [ProfileController::class, 'update']);
    Route::put('/profile/password',[ProfileController::class, 'updatePassword']);
    Route::post('/reservations/{reservation}/pay', [ReservationController::class, 'pay']);
    Route::get('/spaces/{space}/images',                      [SpaceImageController::class, 'index']);
    Route::post('/spaces/{space}/images',                     [SpaceImageController::class, 'store']);
    Route::patch('/spaces/{space}/images/{image}/cover',      [SpaceImageController::class, 'setCover']);
    Route::delete('/spaces/{space}/images/{image}',           [SpaceImageController::class, 'destroy']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/spaces/{space}/availability',
        [SpaceController::class, 'checkAvailability']);

    Route::apiResource('spaces',       SpaceController::class);
    Route::apiResource('equipments',   EquipmentController::class);
    Route::apiResource('reservations', ReservationController::class);
    Route::apiResource('users',        UserController::class);
});
