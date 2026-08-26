<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShiftTemplate extends Model
{
    // This allows Laravel to save these specific fields to the database
    protected $fillable = [
        'restaurant_id', 
        'name', 
        'start_time', 
        'end_time'
    ];

    public function schedules()
    {
        return $this->hasMany(EmployeeSchedule::class);
    }
}