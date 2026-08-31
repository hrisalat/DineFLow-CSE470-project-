<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryPayment extends Model
{
    protected $fillable = [
        'employee_id',
        'restaurant_id',
        'month',
        'base_salary',
        'absent_days',
        'fine_per_day',
        'total_fine',
        'net_salary',
        'paid_at'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
