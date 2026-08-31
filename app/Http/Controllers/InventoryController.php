<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory; // <--- MUST HAVE THIS LINE
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller {

    public function index($res_id)
{
    // This fetches all items belonging to the specific restaurant
    $items = Inventory::where('restaurant_id', $res_id)->get();
    return response()->json($items);
}
    public function store(Request $request) {
    try {
        // This line creates the item in the database
        $item = Inventory::create([
            'restaurant_id'  => $request->restaurant_id,
            'item_name'      => $request->item_name,
            'quantity'       => $request->quantity,
            'unit'           => $request->unit,
            'expiry_date'    => $request->expiry_date,
            'purchase_price' => $request->purchase_price,
        ]);
        return response()->json(['status' => 'success', 'item' => $item], 201);
    } catch (\Exception $e) {
        // If it fails, this sends the REAL error message to your browser
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// 3. Delete an item
    public function destroy($id)
    {
        try {
            $item = Inventory::find($id);
            
            if (!$item) {
                return response()->json(['status' => 'error', 'message' => 'Item not found in database'], 404);
            }

            $item->delete();
            return response()->json(['status' => 'success', 'message' => 'Item deleted'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function getExpiredItems($res_id)
        {
            $today = now()->toDateString();
            
            $expiredItems = Inventory::where('restaurant_id', $res_id)
                                    ->where('expiry_date', '<', $today)
                                    ->get();

            return response()->json($expiredItems);
        }
    }
    
  
