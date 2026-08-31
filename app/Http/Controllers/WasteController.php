<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory;
use App\Models\CustomerWaste;

class WasteController extends Controller
{
    /**
     * Get combined waste data (expired inventory + customer waste)
     */
    public function getWasteData($res_id)
    {
        $today = now()->toDateString();

        // 1. Find Expired inventory
        $expired = Inventory::where('restaurant_id', $res_id)
            ->where('expiry_date', '<', $today)
            ->get();

        // 2. Find Customer Waste
        $customer = CustomerWaste::where('restaurant_id', $res_id)
            ->with('menuItem')
            ->latest()
            ->get();

        return response()->json([
            'expired' => $expired,
            'customer' => $customer
        ]);
    }

    /**
     * Get customer food waste logs
     */
    public function getCustomerWaste($res_id)
    {
        try {
            $customerWaste = CustomerWaste::where('restaurant_id', $res_id)
                ->with('menuItem')
                ->latest()
                ->get();

            return response()->json($customerWaste);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store customer food waste log
     */
    public function storeCustomerWaste(Request $request)
    {
        try {
            $request->validate([
                'restaurant_id' => 'required',
                'menu_item_id' => 'required',
                'quantity' => 'required|numeric|min:1',
                'date' => 'required|date'
            ]);

            $waste = CustomerWaste::create([
                'restaurant_id' => $request->restaurant_id,
                'menu_item_id' => $request->menu_item_id,
                'quantity' => $request->quantity,
                'date' => $request->date
            ]);

            $waste->load('menuItem');

            return response()->json([
                'status' => 'success',
                'data' => $waste
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete customer waste log
     */
    public function destroy($id)
    {
        try {
            $waste = CustomerWaste::find($id);
            if (!$waste) {
                return response()->json(['status' => 'error', 'message' => 'Record not found'], 404);
            }

            $waste->delete();
            return response()->json(['status' => 'success', 'message' => 'Waste log deleted']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
