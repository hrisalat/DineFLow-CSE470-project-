<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['employee_id', 'date', 'check_in_time'];

    // This is required for the attendance list
    public function employee() {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}