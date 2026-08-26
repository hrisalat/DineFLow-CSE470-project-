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
use Twilio\Rest\Client;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $order = Order::create([
                'restaurant_id' => $request->restaurant_id,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'service_type' => $request->service_type,
                'total_price' => $request->total_price,
                'payment_method' => $request->payment_method,
                'status' => 'confirmed'
            ]);

            $receiptItems = "";
            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'item_name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
                $receiptItems .= "- {$item['quantity']}x {$item['name']} (৳" . ($item['price'] * $item['quantity']) . ")\n";
            }

            DB::commit();

            // CALL THE WHATSAPP FUNCTION
            $this->sendWhatsAppReceipt($order, $receiptItems);

            return response()->json(['status' => 'success', 'order_id' => $order->id]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Order Error: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    
    
    public function history($phone)
    {
        $orders = Order::where('customer_phone', $phone)
            ->with('items') 
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
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
}