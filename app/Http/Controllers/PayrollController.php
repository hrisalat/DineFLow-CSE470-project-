<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SalaryPayment;
use App\Models\FineSetting;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Attendance;
use Carbon\Carbon;

class PayrollController extends Controller
{
    /**
     * Get all salary payments for a restaurant
     */
    public function getPayments($res_id)
    {
        return response()->json(
            SalaryPayment::where('restaurant_id', $res_id)
                ->with('employee')
                ->orderBy('paid_at', 'desc')
                ->get()
        );
    }

    /**
     * Get payroll summary for a specific month — returns all employees
     * with their payment status and absence info for that month.
     */
    public function getPayrollSummary($res_id, $month)
    {
        $employees = Employee::where('restaurant_id', $res_id)->get();
        $fineSetting = FineSetting::where('restaurant_id', $res_id)->first();
        $finePerDay = $fineSetting ? $fineSetting->fine_per_day : 0;

        $result = [];

        foreach ($employees as $emp) {
            // Check if already paid
            $payment = SalaryPayment::where('employee_id', $emp->id)
                ->where('month', $month)
                ->first();

            // Calculate absence
            $absenceInfo = $this->calculateAbsence($emp->id, $month);

            $result[] = [
                'employee_id' => $emp->id,
                'name' => $emp->name,
                'position' => $emp->position,
                'salary' => $emp->salary,
                'scheduled_days' => $absenceInfo['scheduled_days'],
                'present_days' => $absenceInfo['present_days'],
                'absent_days' => $absenceInfo['absent_days'],
                'fine_per_day' => $finePerDay,
                'total_fine' => $absenceInfo['absent_days'] * $finePerDay,
                'net_salary' => $emp->salary - ($absenceInfo['absent_days'] * $finePerDay),
                'is_paid' => $payment !== null,
                'paid_at' => $payment ? $payment->paid_at : null,
                'payment' => $payment,
            ];
        }

        return response()->json($result);
    }

    /**
     * Pay an employee for a specific month
     */
    public function payEmployee(Request $request)
    {
        try {
            $employeeId = $request->employee_id;
            $restaurantId = $request->restaurant_id;
            $month = $request->month; // e.g. "2026-08"

            // Check if already paid
            $existing = SalaryPayment::where('employee_id', $employeeId)
                ->where('month', $month)
                ->first();

            if ($existing) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This employee has already been paid for ' . $month
                ], 400);
            }

            $employee = Employee::findOrFail($employeeId);
            $fineSetting = FineSetting::where('restaurant_id', $restaurantId)->first();
            $finePerDay = $fineSetting ? $fineSetting->fine_per_day : 0;

            // Calculate absence for the month
            $absenceInfo = $this->calculateAbsence($employeeId, $month);

            $totalFine = $absenceInfo['absent_days'] * $finePerDay;
            $netSalary = $employee->salary - $totalFine;

            // Ensure net salary doesn't go negative
            if ($netSalary < 0) {
                $netSalary = 0;
            }

            $payment = SalaryPayment::create([
                'employee_id' => $employeeId,
                'restaurant_id' => $restaurantId,
                'month' => $month,
                'base_salary' => $employee->salary,
                'absent_days' => $absenceInfo['absent_days'],
                'fine_per_day' => $finePerDay,
                'total_fine' => $totalFine,
                'net_salary' => $netSalary,
                'paid_at' => now(),
            ]);

            return response()->json([
                'status' => 'success',
                'payment' => $payment,
                'message' => 'Salary paid successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fine setting for a restaurant
     */
    public function getFineSetting($res_id)
    {
        $setting = FineSetting::where('restaurant_id', $res_id)->first();
        return response()->json([
            'fine_per_day' => $setting ? $setting->fine_per_day : 0
        ]);
    }

    /**
     * Save/update fine setting for a restaurant
     */
    public function saveFineSetting(Request $request)
    {
        try {
            $setting = FineSetting::updateOrCreate(
                ['restaurant_id' => $request->restaurant_id],
                ['fine_per_day' => $request->fine_per_day]
            );

            return response()->json([
                'status' => 'success',
                'fine_per_day' => $setting->fine_per_day
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate absence days for an employee in a given month.
     *
     * Logic:
     * 1. Get employee's scheduled days of the week from employee_schedules
     * 2. Count how many of those days fall in the target month = scheduled_days
     * 3. Count attendance records for that month = present_days
     * 4. absent_days = scheduled_days - present_days (min 0)
     */
    private function calculateAbsence($employeeId, $month)
    {
        // Parse the month string to get start and end dates
        $startDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // Get scheduled days of the week for this employee
        $scheduledDays = EmployeeSchedule::where('employee_id', $employeeId)
            ->pluck('day_of_week')
            ->unique()
            ->values()
            ->toArray();

        // Map day names to Carbon day-of-week constants
        $dayMap = [
            'sunday' => Carbon::SUNDAY,
            'monday' => Carbon::MONDAY,
            'tuesday' => Carbon::TUESDAY,
            'wednesday' => Carbon::WEDNESDAY,
            'thursday' => Carbon::THURSDAY,
            'friday' => Carbon::FRIDAY,
            'saturday' => Carbon::SATURDAY,
        ];

        // Count total scheduled working days in the month
        $totalScheduledDays = 0;
        $currentDate = $startDate->copy();

        // Only count up to today if the month is current/future
        $today = Carbon::today();
        $countUntil = $endDate->lt($today) ? $endDate : $today;

        while ($currentDate->lte($countUntil)) {
            foreach ($scheduledDays as $day) {
                $dayLower = strtolower($day);
                if (isset($dayMap[$dayLower]) && $currentDate->dayOfWeek === $dayMap[$dayLower]) {
                    $totalScheduledDays++;
                    break;
                }
            }
            $currentDate->addDay();
        }

        // Count attendance records for this employee in this month
        $presentDays = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate->toDateString(), $countUntil->toDateString()])
            ->count();

        $absentDays = max(0, $totalScheduledDays - $presentDays);

        return [
            'scheduled_days' => $totalScheduledDays,
            'present_days' => $presentDays,
            'absent_days' => $absentDays,
        ];
    }
}
