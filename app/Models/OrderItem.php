<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = ['order_id', 'item_name', 'quantity', 'price', 'custom_notes'];

    // This relationship is required for the history logic to work
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}