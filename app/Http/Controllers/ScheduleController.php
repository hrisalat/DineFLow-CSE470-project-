<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ShiftTemplate;
use App\Models\EmployeeSchedule;
use App\Models\Attendance;
use App\Models\Employee;

class ScheduleController extends Controller
{
    // --- SHIFT TEMPLATE METHODS ---

    public function getTemplates($res_id) {
        return response()->json(ShiftTemplate::where('restaurant_id', $res_id)->get());
    }

    public function storeTemplate(Request $request) {
        ShiftTemplate::create([
            'restaurant_id' => $request->restaurant_id,
            'name' => $request->name,
            'start_time' => $request->start,
            'end_time' => $request->end
        ]);
        return response()->json(['status' => 'success']);
    }

    // NEW: Delete the Master Shift Type
    public function destroyTemplate($id) {
        ShiftTemplate::destroy($id);
        return response()->json(['status' => 'success']);
    }


    // --- WEEKLY SCHEDULE METHODS ---

    public function getSchedules($res_id) {
        return response()->json(
            EmployeeSchedule::where('restaurant_id', $res_id)
            ->with(['employee', 'template'])
            ->get()
        );
    }

    public function storeSchedule(Request $request) {
        EmployeeSchedule::create([
            'restaurant_id' => $request->restaurant_id,
            'employee_id' => $request->employee_id,
            'shift_template_id' => $request->template_id,
            'day_of_week' => $request->day
        ]);
        return response()->json(['status' => 'success']);
    }

    // NEW: Delete individual employee assignment
    public function destroySchedule($id) {
        EmployeeSchedule::destroy($id);
        return response()->json(['status' => 'success']);
    }


    // --- ATTENDANCE METHODS ---

    public function markAttendance(Request $request) {
        // 1. Find employee by email in the EMPLOYEES table
        $employee = Employee::where('email', trim($request->email))->first();

        if (!$employee) {
            return response()->json(['status' => 'error', 'message' => 'Email not recognized in Staff Directory'], 404);
        }

        // 2. Prevent double check-in for the same day
        $exists = Attendance::where('employee_id', $employee->id)
                            ->where('date', now()->toDateString())
                            ->exists();

        if ($exists) {
            return response()->json(['status' => 'error', 'message' => 'You have already checked in today!'], 400);
        }

        // 3. Save attendance
        Attendance::create([
            'employee_id' => $employee->id,
            'date' => now()->toDateString(),
            'check_in_time' => now()->toTimeString()
        ]);

        return response()->json(['status' => 'success', 'name' => $employee->name]);
    }

    public function getAttendance($res_id) {
        return response()->json(
            Attendance::whereHas('employee', function($q) use ($res_id) {
                $q->where('restaurant_id', $res_id);
            })->with('employee')->latest()->get()
        );
    }
}