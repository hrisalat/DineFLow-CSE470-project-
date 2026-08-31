<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltySetting extends Model
{
    protected $fillable = ['restaurant_id', 'points_earned', 'per_purchase_amount', 'offers_description'];
}