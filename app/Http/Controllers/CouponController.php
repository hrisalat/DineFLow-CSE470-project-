<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Coupon;
use App\Models\LoyaltySetting;

class CouponController extends Controller
{
    // 1. Fetch all coupons for the restaurant
    public function getCoupons($res_id) {
        return response()->json(Coupon::where('restaurant_id', $res_id)->get());
    }

  

    // 3. Save new coupon
    public function storeCoupon(Request $request) {
        $coupon = Coupon::create($request->all());
        return response()->json(['status' => 'success', 'data' => $coupon]);
    }

    // 4. Save/Update loyalty points logic
    public function storeLoyalty(Request $request) {
        $setting = LoyaltySetting::updateOrCreate(
            ['restaurant_id' => $request->restaurant_id],
            [
                'points_earned' => $request->points_earned,
                'per_purchase_amount' => $request->per_purchase_amount,
                'offers_description' => $request->offers_description
            ]
        );
        return response()->json(['status' => 'success']);
    }

    public function getLoyalty($res_id) {
            $settings = LoyaltySetting::where('restaurant_id', $res_id)->first();
            // Return the object or an empty one if not found
            return response()->json($settings ?: ['offers_description' => '']);
        }

    // 5. Delete coupon
    public function destroyCoupon($id) {
        Coupon::destroy($id);
        return response()->json(['status' => 'success']);
    }
}