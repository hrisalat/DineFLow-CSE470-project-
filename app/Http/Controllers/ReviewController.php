<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;

class ReviewController extends Controller
{
    // 1. Submit a rating for a specific menu item
    public function store(Request $request)
    {
        try {
            $review = Review::create([
                'user_id'       => $request->user_id,
                'restaurant_id' => $request->restaurant_id,
                'menu_item_id'  => $request->menu_item_id,
                'rating'        => $request->rating,
                'comment'       => $request->comment,
            ]);

            return response()->json(['status' => 'success', 'data' => $review], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 2. Fetch all reviews for a specific item (for the "View Reviews" modal)
    public function getItemReviews($item_id)
    {
        // This brings the customer names along with the comments
        $reviews = Review::where('menu_item_id', $item_id)
                         ->with('user') 
                         ->latest()
                         ->get();

        return response()->json($reviews);
    }

    // 3. Delete a review
    public function destroy($id)
    {
        Review::destroy($id);
        return response()->json(['status' => 'success']);
    }
}