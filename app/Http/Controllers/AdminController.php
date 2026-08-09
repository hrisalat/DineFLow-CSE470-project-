<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    // 1. Add Employee Logic
    public function addEmployee(Request $request)
    {
        try {
            // Generate 10-digit alphanumeric unique ID
            $uniqueId = strtoupper(Str::random(10));

            $employee = new Employee();
            $employee->restaurant_id = $request->restaurant_id;
            $employee->name = $request->name;
            $employee->email = $request->email;
            $employee->phone = $request->phone;
            $employee->nid_birth_cert = $request->nid;
            $employee->position = $request->position;
            $employee->salary = $request->salary;
            $employee->unique_id = $uniqueId;

            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('employees', 'public');
                $employee->photo = $path;
            }

            $employee->save();

            return response()->json(['status' => 'success', 'employee' => $employee], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 2. Fetch Employees for a specific restaurant
    public function getEmployees($restaurant_id)
    {
        $employees = Employee::where('restaurant_id', $restaurant_id)->get();
        return response()->json($employees);
    }

    public function employeeLogin(Request $request) {
    // 1. Find the employee by ID and Email
    $employee = \App\Models\Employee::where('unique_id', $request->unique_id)
                                    ->where('email', $request->email)
                                    ->first();

    // 2. Check if employee exists and password is correct
    if ($employee && \Illuminate\Support\Facades\Hash::check($request->password, $employee->password)) {
        
        // 3. Fetch the restaurant details so the UI stays themed
        $restaurant = \App\Models\Restaurant::find($employee->restaurant_id);

        return response()->json([
            'status' => 'success', 
            'message' => 'Login Successful',
            'restaurant' => $restaurant, // Needed for TopBar color/logo
            'employee' => $employee
        ]);
    }

    return response()->json([
        'status' => 'error', 
        'message' => 'Invalid ID, Email, or Password'
    ], 401);
}

// 3. Delete Employee Logic
public function deleteEmployee($id)
{
    try {
        $employee = Employee::find($id);
        if ($employee) {
            // Delete the photo from storage if it exists
            if ($employee->photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($employee->photo);
            }
            
            $employee->delete();
            return response()->json(['status' => 'success', 'message' => 'Employee removed successfully']);
        }
        return response()->json(['status' => 'error', 'message' => 'Employee not found'], 404);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}
}