<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class EmployeeSchedule extends Model {
    protected $fillable = ['restaurant_id', 'employee_id', 'shift_template_id', 'day_of_week'];

    public function employee() {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function template() {
        return $this->belongsTo(ShiftTemplate::class, 'shift_template_id');
    }
}