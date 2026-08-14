<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItemIngredient extends Model
{
    protected $fillable = ['menu_item_id', 'inventory_id', 'quantity_needed'];
}
