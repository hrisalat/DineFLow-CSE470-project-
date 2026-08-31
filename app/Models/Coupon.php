<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['restaurant_id', 'code', 'discount_amount', 'min_purchase'];
}