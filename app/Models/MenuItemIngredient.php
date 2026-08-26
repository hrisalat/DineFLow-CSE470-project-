<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItemIngredient extends Model
{
    // This UNLOCKS the columns so Laravel can save the data you send from React
    protected $fillable = [
        'menu_item_id', 
        'inventory_id', 
        'quantity_needed'
    ];

    // Link back to the inventory item (optional but good for logic)
    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }
}