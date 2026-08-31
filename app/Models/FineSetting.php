<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FineSetting extends Model
{
    protected $fillable = [
        'restaurant_id',
        'fine_per_day'
    ];
}
