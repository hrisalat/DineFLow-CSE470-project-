<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperatingExpense extends Model
{
    protected $fillable = [
        'restaurant_id',
        'month',
        'rent',
        'electricity_bill',
        'gas_bill',
        'water_bill',
        'other_bills'
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
