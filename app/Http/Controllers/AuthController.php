<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Handle Restaurant and Owner Registration
     */
    public function register(Request $request)
    {
        try {
            // 1. Create the Restaurant
            $restaurant = Restaurant::create([
                'restaurant_name' => $request->name,        // From React 'name'
                'email_primary'   => $request->email1,      // From React 'email1'
                'email_secondary' => $request->email2,      // From React 'email2'
                'phone'           => $request->phone,       // From React 'phone'
                'registration_no' => $request->regNo,       // From React 'regNo'
                'accent_color'    => $request->color,       // From React 'color'
            ]);

            // 2. Handle Logo Upload
            if ($request->hasFile('logo')) {
                // This saves the file to: storage/app/public/logos
                $path = $request->file('logo')->store('logos', 'public');
                
                // Save the path string to the database
                $restaurant->logo = $path; 
                $restaurant->save();
            }

            // 3. Create the Owner User and link to the Restaurant
            User::create([
                'name' => $request->name . " Owner",
                'email' => $request->email1,
                'password' => Hash::make($request->password),
                'role' => 'owner',
                'restaurant_id' => $restaurant->id,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Restaurant and Owner registered successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error("Registration Error: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Login
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Find the restaurant details to send back to React for the TopBar
            $restaurant = Restaurant::find($user->restaurant_id);

            return response()->json([
                'status' => 'success',
                'user' => $user,
                'restaurant' => $restaurant // This contains name, accent_color, and logo path
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid email or password'
        ], 401);
    }
}