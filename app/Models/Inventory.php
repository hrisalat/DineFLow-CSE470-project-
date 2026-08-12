<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    // This allows Laravel to save these fields
    protected $fillable = [
        'restaurant_id', 
        'item_name', 
        'quantity', 
        'expiry_date', 
        'purchase_price'
    ];
}