<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\MenuItemIngredient;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MenuController extends Controller
{
    // 1. Get all categories and items for a restaurant
    public function index($res_id)
    {
        $categories = Category::where('restaurant_id', $res_id)
            ->with('items.ingredients') // Load items and their ingredient links
            ->get();
        return response()->json($categories);
    }

    // 2. Store Category (Image removed as requested)
      public function storeCategory(Request $request)
        {
            try {
                $category = Category::create([
                    'restaurant_id' => $request->restaurant_id,
                    'name' => $request->name,
                    'description' => $request->description,
                ]);

                return response()->json(['status' => 'success', 'category' => $category]);
            } catch (\Exception $e) {
                // This will send the real error to your browser console
                return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
            }
        }

    // 3. Update Category
    public function updateCategory(Request $request, $id)
    {
        $category = Category::find($id);
        $category->update($request->only(['name', 'description']));
        return response()->json(['status' => 'success']);
    }

    // 4. Store Menu Item
    public function storeMenuItem(Request $request)
    {
        try {
            // Image is Mandatory for new items
            if (!$request->hasFile('image')) {
                return response()->json(['status' => 'error', 'message' => 'Image is mandatory'], 422);
            }

            $item = new MenuItem();
            $this->saveItemLogic($item, $request);

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Update Menu Item
    public function updateMenuItem(Request $request, $id)
    {
        try {
            $item = MenuItem::findOrFail($id);
            $this->saveItemLogic($item, $request);
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // Shared logic for Store and Update
    private function saveItemLogic($item, $request)
    {
        $item->category_id = $request->category_id;
        $item->name = $request->name;
        $item->description = $request->description ?? ''; // Prevent null inheritance
        $item->tag = $request->tag;
        $item->price_type = $request->price_type;

        // Handle Pricing Logic
        if ($request->price_type === 'fixed') {
            $item->price = $request->price;
            $item->price_options = null;
        } else {
            $item->price = null;
            // price_options comes as a JSON string from React FormData
            $item->price_options = json_decode($request->price_options, true);
        }

        // Handle Image
        if ($request->hasFile('image')) {
            // Delete old image if updating
            if ($item->image) {
                Storage::disk('public')->delete($item->image);
            }
            $item->image = $request->file('image')->store('menu_items', 'public');
        }

        $item->save();

        // Handle Ingredients mapping
        if ($request->ingredients) {
            $ingredients = json_decode($request->ingredients, true);
            // Clear old ingredients to prevent duplicates on update
            MenuItemIngredient::where('menu_item_id', $item->id)->delete();

            foreach ($ingredients as $ing) {
                if (!empty($ing['inventory_id'])) {
                    MenuItemIngredient::create([
                        'menu_item_id' => $item->id,
                        'inventory_id' => $ing['inventory_id'],
                        'quantity_needed' => $ing['quantity']
                    ]);
                }
            }
        }
    }

    // 6. Delete Category
    public function destroyCategory($id)
    {
        $category = Category::findOrFail($id);
        // MenuItem files will need manual cleanup or a bootable model delete
        $category->delete();
        return response()->json(['status' => 'success']);
    }

    // 7. Delete Menu Item
    public function destroyMenuItem($id)
    {
        $item = MenuItem::findOrFail($id);
        if ($item->image) {
            Storage::disk('public')->delete($item->image);
        }
        $item->delete();
        return response()->json(['status' => 'success']);
    }
}