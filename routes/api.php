<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\InventoryController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/restaurant/update', [RestaurantController::class, 'updateProfile']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

use App\Http\Controllers\AdminController;

// Employee Management Routes
Route::post('/employees/add', [AdminController::class, 'addEmployee']);
Route::get('/employees/{restaurant_id}', [AdminController::class, 'getEmployees']);

Route::post('/employee/signup', [App\Http\Controllers\AuthController::class, 'employeeSignup']);
Route::post('/employee/login', [AuthController::class, 'employeeLogin']);
Route::post('/admin/verify', [AuthController::class, 'verifyAdminPassword']);
Route::post('/admin/verify', [App\Http\Controllers\AuthController::class, 'verifyAdminPassword']);
Route::delete('/employees/{id}', [App\Http\Controllers\AdminController::class, 'deleteEmployee']);
Route::post('/restaurant/update/{id}', [App\Http\Controllers\AdminController::class, 'updateRestaurant']);
Route::post('/customer/register', [AuthController::class, 'customerRegister']);
Route::post('/customer/login', [AuthController::class, 'customerLogin']);
Route::get('/inventory/{res_id}', [InventoryController::class, 'index']);
Route::post('/inventory', [InventoryController::class, 'store']);
Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);