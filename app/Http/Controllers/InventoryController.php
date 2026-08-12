<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory; // Ensure this matches your Model name
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    // 1. Get all items for a specific restaurant
    public function index($res_id)
    {
        try {
            // Check if items exist, if not return empty array instead of crashing
            $items = Inventory::where('restaurant_id', $res_id)->get();
            return response()->json($items, 200);
        } catch (\Exception $e) {
            Log::error("Inventory Index Error: " . $e->getMessage());
            return response()->json(['error' => 'Database error'], 500);
        }
    }

    // 2. Save a new item
    public function store(Request $request)
    {
        try {
            $item = Inventory::create([
                'restaurant_id'  => $request->restaurant_id,
                'item_name'      => $request->item_name,
                'quantity'       => $request->quantity,
                'expiry_date'    => $request->expiry_date,
                'purchase_price' => $request->purchase_price,
            ]);
            return response()->json(['status' => 'success', 'item' => $item], 201);
        } catch (\Exception $e) {
            Log::error("Inventory Store Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 3. Delete an item
    public function destroy($id)
    {
        try {
            Inventory::destroy($id);
            return response()->json(['status' => 'success'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed'], 500);
        }
    }
}