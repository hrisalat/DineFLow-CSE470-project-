<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;   // Ensure this is here
use App\Models\ExcludedTime;  // Ensure this is here

class ReservationController extends Controller
{
    // 1. STAFF: Get all pending reservations for the restaurant
    public function getStaffReservations($res_id)
    {
        try {
            $reservations = Reservation::where('restaurant_id', $res_id)
                ->where('status', 'pending')
                ->get();

            return response()->json($reservations);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 2. CUSTOMER: Get only my reservations via phone number
    public function getCustomerReservations($res_id, $phone)
    {
        try {
            $reservations = Reservation::where('restaurant_id', $res_id)
                ->where('phone', $phone)
                ->where('status', 'pending')
                ->get();

            return response()->json($reservations);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 3. UNIVERSAL: Create a reservation
    public function store(Request $request)
    {
        try {
            $reservation = Reservation::create([
                'restaurant_id' => $request->restaurant_id,
                'name' => $request->name,
                'phone' => $request->phone,
                'date' => $request->date,
                'time' => $request->time,
                'status' => 'pending'
            ]);
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 4. UNIVERSAL: Delete/Cancel reservation
    public function destroy($id)
    {
        Reservation::destroy($id);
        return response()->json(['status' => 'success']);
    }
}