<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email1' => 'required|email',
            'password' => 'required|string|min:5',
            'phone' => 'required|string',
            'regNo' => 'required|string',
        ]);
        

        $emailExists = User::where('email', $request->email1)->exists() || Restaurant::where('email_primary', $request->email1)->exists();
        if ($emailExists) {
            return response()->json(['status' => 'error', 'message' => 'Registration Failed: The email has already been taken.'], 422);
        }

        try {
            // 1. Create Restaurant
            $restaurant = Restaurant::create([
                'restaurant_name' => $request->name,
                'email_primary'   => $request->email1,
                'phone'           => $request->phone,
                'registration_no' => $request->regNo,
                'accent_color'    => $request->color,
                'is_website_active' => true,
                
            ]);

            if ($request->hasFile('logo')) {
                $restaurant->logo = $request->file('logo')->store('logos', 'public');
                $restaurant->save();
            }

            // 2. Create Owner User
            User::create([
                'name' => $request->name . " Owner",
                'email' => $request->email1,
                'password' => Hash::make($request->password),
                'role' => 'owner',
                'restaurant_id' => $restaurant->id,
                'phone' => $request->phone,
                 'loyalty_points' => $user->loyalty_points 
            ]);

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function login(Request $request) {
        $credentials = $request->only('email', 'password');
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $restaurant = Restaurant::find($user->restaurant_id);
            return response()->json(['status' => 'success', 'restaurant' => $restaurant, 'user' => $user]);
        }
        return response()->json(['status' => 'error', 'message' => 'Invalid email or password'], 401);
    }

    public function verifyAdminPassword(Request $request) {
        $user = User::where('restaurant_id', $request->restaurant_id)->where('role', 'owner')->first();
        if ($user && Hash::check($request->password, $user->password)) {
            return response()->json(['status' => 'success']);
        }
        return response()->json(['status' => 'error', 'message' => 'Incorrect Admin Password'], 401);
    }

    public function employeeLogin(Request $request) {
        $employee = Employee::where('email', $request->email)->first();
        if ($employee && Hash::check($request->password, $employee->password)) {
            $pos = strtolower($employee->position);
            $expected = strtolower($request->expected_role);
            $staffPositions = ['chef', 'waiter', 'cleaner'];

            if ($expected === 'manager' && $pos !== 'manager') {
                return response()->json(['status' => 'error', 'message' => 'Access Denied: Not a Manager'], 403);
            } 
            if ($expected === 'staff' && !in_array($pos, $staffPositions)) {
                return response()->json(['status' => 'error', 'message' => 'Access Denied: Not Staff'], 403);
            }

            $restaurant = Restaurant::find($employee->restaurant_id);
            return response()->json(['status' => 'success', 'restaurant' => $restaurant, 'employee' => $employee]);
        }
        return response()->json(['status' => 'error', 'message' => 'Invalid Email or Password'], 401);
    }

    public function customerRegister(Request $request) {
        try {
            $existing = User::where('phone', $request->phone)
                            ->where('role', 'customer')
                            ->first();
            if ($existing) {
                return response()->json(['status' => 'error', 'message' => 'Phone number already registered'], 400);
            }

            $user = User::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'customer',
                'restaurant_id' => $request->restaurant_id,
            ]);

            return response()->json([
                'status' => 'success',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // Inside AuthController.php

public function customerLogin(Request $request) {
    $user = User::where('role', 'customer')->where('phone', $request->phone)->first();
    if ($user && Hash::check($request->password, $user->password)) {
        return response()->json([
            'status' => 'success', 
            'user' => [
                'id' => $user->id,    // <--- THIS IS THE MISSING LINK
                'name' => $user->name,
                'phone' => $user->phone
            ]
        ]);
    }
    return response()->json(['status' => 'error'], 401);
}

    public function employeeSignup(Request $request) {
        $employee = Employee::where('unique_id', $request->unique_id)
                            ->where('email', $request->email)
                            ->first();

        if (!$employee) {
            return response()->json(['status' => 'error', 'message' => 'Invalid Unique ID or Email address.'], 404);
        }

        $employee->password = Hash::make($request->password);
        $employee->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Account created successfully! Please log in.'
        ]);
    }

    public function getLoyaltyPoints($id)
        {
            // Find the user in the 'users' table (your screenshot table)
            $user = \App\Models\User::find($id);
            
            if ($user) {
                return response()->json([
                    'loyalty_points' => $user->loyalty_points // This matches your SQL column name
                ]);
            }
            
            return response()->json(['loyalty_points' => 0], 404);
        }
}