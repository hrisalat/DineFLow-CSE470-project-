<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/restaurant/update', [RestaurantController::class, 'updateProfile']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Employee Management Routes
Route::post('/employees/add', [AdminController::class, 'addEmployee']);
Route::get('/employees/{restaurant_id}', [AdminController::class, 'getEmployees']);

Route::post('/employee/signup', [AuthController::class, 'employeeSignup']);
Route::post('/employee/login', [AuthController::class, 'employeeLogin']);
Route::post('/admin/verify', [AuthController::class, 'verifyAdminPassword']);
Route::delete('/employees/{id}', [AdminController::class, 'deleteEmployee']);
Route::post('/restaurant/update/{id}', [AdminController::class, 'updateRestaurant']);
Route::post('/customer/register', [AuthController::class, 'customerRegister']);
Route::post('/customer/login', [AuthController::class, 'customerLogin']);
Route::get('/inventory/{res_id}', [InventoryController::class, 'index']);
Route::post('/inventory', [InventoryController::class, 'store']);
Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);

use App\Http\Controllers\MenuController;





// Categories
Route::post('/menu/category', [MenuController::class, 'storeCategory']);
Route::post('/menu/category/update/{id}', [MenuController::class, 'updateCategory']);
Route::delete('/menu/category/{id}', [MenuController::class, 'destroyCategory']);

// Menu Items
Route::get('/menu/{res_id}', [MenuController::class, 'index']);
Route::post('/menu/item', [MenuController::class, 'storeMenuItem']);
Route::post('/menu/item/update/{id}', [MenuController::class, 'updateMenuItem']);
Route::delete('/menu/item/{id}', [MenuController::class, 'destroyMenuItem']);

Route::post('/restaurant/toggle-website/{id}', [AdminController::class, 'toggleWebsite']);

Route::post('/orders', [OrderController::class, 'store']);
Route::get('/customer/history/{phone}', [OrderController::class, 'history']);

Route::get('/customer/previous-items/{phone}', [OrderController::class, 'getUniquePreviousItems']);
Route::get('/customer/recommendations/{phone}', [App\Http\Controllers\OrderController::class, 'getRecommendations']);

use App\Http\Controllers\BkashController;

Route::post('/bkash/create', [BkashController::class, 'createPayment']);

Route::get('/reviews/{res_id}', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);



// 2. Add these specific review routes at the bottom
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/item-reviews/{item_id}', [ReviewController::class, 'getItemReviews']);
Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);




use App\Http\Controllers\ScheduleController;
// Shift Templates (Morning, Night, etc.)
Route::get('/shift-templates/{res_id}', [ScheduleController::class, 'getTemplates']);
Route::post('/shift-templates', [ScheduleController::class, 'storeTemplate']);
Route::delete('/shift-templates/{id}', [ScheduleController::class, 'destroyTemplate']);

// Weekly Schedules (Assigning Staff)
Route::get('/schedules/{res_id}', [ScheduleController::class, 'getSchedules']);
Route::post('/schedules', [ScheduleController::class, 'storeSchedule']);
Route::delete('/schedules/{id}', [ScheduleController::class, 'destroySchedule']);

// Attendance
Route::get('/attendance/{res_id}', [ScheduleController::class, 'getAttendance']);
Route::post('/attendance/mark', [ScheduleController::class, 'markAttendance']);

Route::delete('/shift-templates/{id}', [ScheduleController::class, 'destroyTemplate']);
Route::delete('/schedules/{id}', [ScheduleController::class, 'destroySchedule']);

// Order Progress Routes
Route::get('/orders/all/{res_id}', [OrderController::class, 'getAllOrders']);
Route::post('/orders/update-status/{id}', [OrderController::class, 'updateStatus']);
Route::get('/customer/active-orders/{phone}', [OrderController::class, 'customerActiveOrders']);
Route::get('/order-lookup/{id}', [OrderController::class, 'lookupOrder']);

use App\Http\Controllers\CouponController;

// Coupon & Loyalty Routes
Route::get('/coupons/{res_id}', [CouponController::class, 'getCoupons']);
Route::post('/coupons', [CouponController::class, 'storeCoupon']);
Route::delete('/coupons/{id}', [CouponController::class, 'destroyCoupon']);

Route::get('/loyalty-settings/{res_id}', [CouponController::class, 'getLoyalty']);
Route::post('/loyalty-settings', [CouponController::class, 'storeLoyalty']);
Route::delete('/coupons/{id}', [App\Http\Controllers\CouponController::class, 'destroyCoupon']);
Route::get('/customer/points/{id}', [App\Http\Controllers\AuthController::class, 'getLoyaltyPoints']);

Route::get('/inventory/expired/{res_id}', [InventoryController::class, 'getExpiredItems']);

use App\Http\Controllers\WasteController;

Route::get('/waste-data/{res_id}', [WasteController::class, 'getWasteData']);
Route::get('/waste/customer/{res_id}', [WasteController::class, 'getCustomerWaste']);
Route::post('/waste/customer', [WasteController::class, 'storeCustomerWaste']);
Route::delete('/waste/customer/{id}', [WasteController::class, 'destroy']);

use App\Http\Controllers\ReservationController;

// Staff Routes
Route::get('/reservations/staff/{res_id}', [ReservationController::class, 'getStaffReservations']);

// Customer Routes
Route::get('/reservations/customer/{res_id}/{phone}', [ReservationController::class, 'getCustomerReservations']);

// Shared Routes
Route::post('/reservations', [ReservationController::class, 'store']);
Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);

use App\Http\Controllers\PayrollController;

// Payroll & Fine Routes
Route::get('/payroll/{res_id}/{month}', [PayrollController::class, 'getPayrollSummary']);
Route::get('/payroll/{res_id}', [PayrollController::class, 'getPayments']);
Route::post('/payroll/pay', [PayrollController::class, 'payEmployee']);
Route::get('/fine-setting/{res_id}', [PayrollController::class, 'getFineSetting']);
Route::post('/fine-setting', [PayrollController::class, 'saveFineSetting']);

use App\Http\Controllers\FinanceController;

// Finance Management Routes
Route::get('/finances/summary/{res_id}', [FinanceController::class, 'getSummary']);
Route::get('/finances/expenses/{res_id}', [FinanceController::class, 'getExpenses']);
Route::post('/finances/expenses', [FinanceController::class, 'saveExpenses']);