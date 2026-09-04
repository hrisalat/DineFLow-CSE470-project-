<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Inventory; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http; 
use Illuminate\Support\Facades\Log;
use App\Models\LoyaltySetting;
use App\Models\User;  
use Twilio\Rest\Client;

class OrderController extends Controller
{
    public function store(Request $request)
            {
                \DB::beginTransaction();
                try {
                    // 1. Create the Order
                    $order = Order::create([
                        'restaurant_id' => $request->restaurant_id,
                        'customer_name' => $request->customer_name,
                        'customer_phone' => trim($request->customer_phone), // trim ensures no spaces
                        'service_type' => $request->service_type,
                        'total_price' => $request->total_price,
                        'payment_method' => $request->payment_method,
                        'status' => 'confirmed'
                    ]);

                    // 2. Save items and deduct inventory
                    foreach ($request->items as $item) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'item_name' => $item['name'],
                            'quantity' => $item['quantity'],
                            'price' => $item['price'],
                        ]);

                        // ... your existing inventory deduction logic ...
                    }

                    // --- NEW: LOYALTY POINTS LOGIC ---
                    $settings = \App\Models\LoyaltySetting::where('restaurant_id', $request->restaurant_id)->first();
                    
                    if ($settings && $settings->per_purchase_amount > 0) {
                        // Calculate: (Total Price / Rule Amount) * Points Per Rule
                        // e.g. (500 TK / 100 TK) * 10 points = 50 points
                        $pointsToEarn = floor($request->total_price / $settings->per_purchase_amount) * $settings->points_earned;

                        if ($pointsToEarn > 0) {
                            // Find the user by phone and add points
                            \App\Models\User::where('phone', $request->customer_phone)
                                            ->increment('loyalty_points', $pointsToEarn);
                        }
                    }

                    \DB::commit();

                    return response()->json([
                        'status' => 'success',
                        'order_id' => $order->id
                    ]);

                } catch (\Exception $e) {
                    \DB::rollback();
                    return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
                }
            }
            
    


    // 1. Get ALL orders for a specific restaurant (Staff/Manager view)
    public function getAllOrders($res_id) {
        return Order::where('restaurant_id', $res_id)
                    ->with('items')
                    ->latest()
                    ->get();
    }

    // 2. Update Order Status
    public function updateStatus(Request $request, $id) {
        $order = Order::findOrFail($id);
        $order->status = $request->status; // waiting, Preparing, Completed
        $order->save();
        return response()->json(['status' => 'success']);
    }

    // 3. Get specific customer's active orders
    public function customerActiveOrders($phone) {
    return Order::where('customer_phone', $phone)
                ->with('items')
                ->where('status', '!=', 'Delivered') // Only hide when fully delivered
                ->latest()
                ->get();
    }

    public function lookupOrder($id) {
    $order = Order::with('items')->find($id);
    if (!$order) {
        return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
    }
    return response()->json($order);
    }

    

    public function getUniquePreviousItems($phone)
    {
        try {
            $itemNames = OrderItem::whereHas('order', function($query) use ($phone) {
                    $query->where('customer_phone', $phone);
                })
                ->distinct()
                ->pluck('item_name')
                ->toArray();

            if (empty($itemNames)) {
                return response()->json([]);
            }

            // Fetch Menu Items with ingredients for stock checking
            $allMenuItems = MenuItem::with('ingredients')->get();

            $recommendedItems = $allMenuItems->filter(function($menuItem) use ($itemNames) {
                foreach ($itemNames as $orderedName) {
                    if (stripos($orderedName, $menuItem->name) !== false) {
                        return true;
                    }
                }
                return false;
            })->values();

            return response()->json($recommendedItems);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function history($phone)
    {
        try {
            // Fetch orders for this phone number and include the items
            $orders = Order::where('customer_phone', $phone)
                           ->with('items') 
                           ->orderBy('created_at', 'desc')
                           ->get();

            return response()->json($orders);
        } catch (\Exception $e) {
            // This error message will appear in your browser's Network tab
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}