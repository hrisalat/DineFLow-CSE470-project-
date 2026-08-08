<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Log; // Add this line

class RestaurantController extends Controller {
    public function updateProfile(Request $request) {
        // This writes the data to storage/logs/laravel.log
        Log::info('Data received from React:', $request->all());

        try {
            $restaurant = Restaurant::updateOrCreate(
                ['id' => 1],
                [
                    'name' => $request->name,
                    'accent_color' => $request->accent_color
                ]
            );

            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('logos', 'public');
                $restaurant->logo = $path;
                $restaurant->save();
            }

            return response()->json(['status' => 'Success', 'data' => $restaurant], 200);
        } catch (\Exception $e) {
            Log::error('Error saving restaurant: ' . $e->getMessage());
            return response()->json(['status' => 'Error', 'message' => $e->getMessage()], 500);
        }
    }
}