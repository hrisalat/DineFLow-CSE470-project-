<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'restaurant_id', 'customer_name', 'customer_phone', 
        'service_type', 'total_price', 'payment_method', 'status'
    ];

    // This is the CRITICAL part
    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

}