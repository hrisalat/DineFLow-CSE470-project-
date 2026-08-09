<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * 1. Restaurant Owner Registration
     * Creates both a Restaurant and an Owner User account.
     */
    public function register(Request $request) {
        $restaurant = Restaurant::create([
            'restaurant_name' => $request->name,
            'email_primary'   => $request->email1,
            'email_secondary' => $request->email2,
            'phone'           => $request->phone,
            'registration_no' => $request->regNo,
            'accent_color'    => $request->color,
        ]);

        if ($request->hasFile('logo')) {
            $restaurant->logo = $request->file('logo')->store('logos', 'public');
            $restaurant->save();
        }

        // Create the Owner account
        User::create([
            'name' => $request->name . " Owner",
            'email' => $request->email1,
            'password' => Hash::make($request->password),
            'role' => 'owner', // This is crucial for Admin Verification
            'restaurant_id' => $restaurant->id,
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * 2. Restaurant Owner Login
     */
    public function login(Request $request) {
        $credentials = $request->only('email', 'password');
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $restaurant = Restaurant::find($user->restaurant_id);
            return response()->json(['status' => 'success', 'restaurant' => $restaurant]);
        }
        return response()->json(['status' => 'error', 'message' => 'Invalid credentials'], 401);
    }

    /**
     * 3. Admin Panel Verification
     * Specifically checks the owner's password when entering the Admin Panel.
     */
    public function verifyAdminPassword(Request $request) {
        // Find the user who is the OWNER of this specific restaurant
        $user = User::where('restaurant_id', $request->restaurant_id)
                    ->where('role', 'owner')
                    ->first();

        if ($user && Hash::check($request->password, $user->password)) {
            return response()->json(['status' => 'success']);
        }

        return response()->json([
            'status' => 'error', 
            'message' => 'Incorrect Admin Password. Use the password from your registration.'
        ], 401);
    }

    /**
     * 4. Employee (Manager/Staff) Signup Logic
     * Matches Unique ID and Email before allowing password creation.
     */
    public function employeeSignup(Request $request) {
        $employee = Employee::where('unique_id', $request->unique_id)
                            ->where('email', $request->email)
                            ->first();

        if (!$employee) {
            return response()->json([
                'status' => 'error', 
                'message' => 'Invalid Unique ID or Email.'
            ], 404);
        }

        $employee->password = Hash::make($request->password);
        $employee->save();

        return response()->json([
            'status' => 'success', 
            'message' => 'Account created! You can now login.'
        ]);
    }

    /**
     * 5. Employee (Manager/Staff) Login Logic
     * Uses Email/Password and enforces role-based access.
     */
    public function employeeLogin(Request $request) {
        $employee = Employee::where('email', $request->email)->first();

        if ($employee && Hash::check($request->password, $employee->password)) {
            
            $pos = strtolower($employee->position);
            $expected = strtolower($request->expected_role);

            // Grouping: Chef, Waiter, and Cleaner are all "Staff"
            $staffPositions = ['chef', 'waiter', 'cleaner'];

            if ($expected === 'manager') {
                if ($pos !== 'manager') {
                    return response()->json(['status' => 'error', 'message' => 'Access Denied: You are not a Manager'], 403);
                }
            } else if ($expected === 'staff') {
                if (!in_array($pos, $staffPositions)) {
                    return response()->json(['status' => 'error', 'message' => 'Access Denied: You are not registered as Staff'], 403);
                }
            }

            $restaurant = Restaurant::find($employee->restaurant_id);
            return response()->json([
                'status' => 'success', 
                'restaurant' => $restaurant,
                'employee' => $employee
            ]);
        }
        return response()->json(['status' => 'error', 'message' => 'Invalid Email or Password'], 401);
    }
}