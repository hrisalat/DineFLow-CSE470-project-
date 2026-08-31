<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Inventory;
use App\Models\SalaryPayment;
use App\Models\OperatingExpense;

class FinanceController extends Controller
{
    /**
     * Get full financial summary for a restaurant
     * Optional query param: ?month=YYYY-MM or 'all'
     */
    public function getSummary(Request $request, $res_id)
    {
        try {
            $month = $request->query('month'); // e.g. "2026-08" or null/all

            // 1. Orders
            $ordersQuery = Order::where('restaurant_id', $res_id)->with('items')->latest();
            if ($month && $month !== 'all') {
                $ordersQuery->where('created_at', 'like', $month . '%');
            }
            $orders = $ordersQuery->get();
            $totalRevenue = (float) $orders->sum('total_price');

            // 2. Raw Inventory Purchases
            $inventoryQuery = Inventory::where('restaurant_id', $res_id)->latest();
            if ($month && $month !== 'all') {
                $inventoryQuery->where('created_at', 'like', $month . '%');
            }
            $inventories = $inventoryQuery->get();
            $totalInventoryExpense = (float) $inventories->sum('purchase_price');

            // 3. Paid Employee Salaries
            $salariesQuery = SalaryPayment::where('restaurant_id', $res_id)->with('employee')->latest('paid_at');
            if ($month && $month !== 'all') {
                $salariesQuery->where('month', $month);
            }
            $salaries = $salariesQuery->get();
            $totalSalaryExpense = (float) $salaries->sum('net_salary');

            // 4. Operating Expenses (Rent & Bills)
            $expenseQuery = OperatingExpense::where('restaurant_id', $res_id);
            if ($month && $month !== 'all') {
                $expenseQuery->where(function ($q) use ($month) {
                    $q->where('month', $month)->orWhereNull('month');
                });
            }
            $expense = $expenseQuery->latest()->first();

            $rent = $expense ? (float) $expense->rent : 0;
            $electricity = $expense ? (float) $expense->electricity_bill : 0;
            $gas = $expense ? (float) $expense->gas_bill : 0;
            $water = $expense ? (float) $expense->water_bill : 0;
            $other = $expense ? (float) $expense->other_bills : 0;
            $totalOperatingExpense = $rent + $electricity + $gas + $water + $other;

            // 5. Aggregates & Profit Calculations
            // Total Expenditure = Raw Inventory + Paid Salaries + Rent/Bills
            $totalExpenditure = $totalInventoryExpense + $totalSalaryExpense + $totalOperatingExpense;

            // Gross Profit = Total Revenue - Cost of Goods Sold (Raw Inventory)
            $grossProfit = $totalRevenue - $totalInventoryExpense;

            // Net Profit = Total Revenue - Total Expenditure
            $netProfit = $totalRevenue - $totalExpenditure;

            return response()->json([
                'status' => 'success',
                'orders' => $orders,
                'inventories' => $inventories,
                'salaries' => $salaries,
                'operating_expenses' => [
                    'rent' => $rent,
                    'electricity_bill' => $electricity,
                    'gas_bill' => $gas,
                    'water_bill' => $water,
                    'other_bills' => $other,
                    'total_operating_expense' => $totalOperatingExpense,
                ],
                'summary' => [
                    'total_revenue' => round($totalRevenue, 2),
                    'total_inventory_expense' => round($totalInventoryExpense, 2),
                    'total_salary_expense' => round($totalSalaryExpense, 2),
                    'total_operating_expense' => round($totalOperatingExpense, 2),
                    'total_expenditure' => round($totalExpenditure, 2),
                    'gross_profit' => round($grossProfit, 2),
                    'net_profit' => round($netProfit, 2),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get operating expenses for a restaurant
     */
    public function getExpenses(Request $request, $res_id)
    {
        $month = $request->query('month');
        $query = OperatingExpense::where('restaurant_id', $res_id);
        if ($month && $month !== 'all') {
            $query->where(function ($q) use ($month) {
                $q->where('month', $month)->orWhereNull('month');
            });
        }
        $expense = $query->latest()->first();

        return response()->json([
            'status' => 'success',
            'expense' => $expense ?: [
                'rent' => 0,
                'electricity_bill' => 0,
                'gas_bill' => 0,
                'water_bill' => 0,
                'other_bills' => 0,
            ]
        ]);
    }

    /**
     * Save or update operating expenses for a restaurant (rent, bills)
     */
    public function saveExpenses(Request $request)
    {
        try {
            $restaurantId = $request->restaurant_id;
            $month = $request->month ?: null;

            $expense = OperatingExpense::updateOrCreate(
                [
                    'restaurant_id' => $restaurantId,
                    'month' => $month
                ],
                [
                    'rent' => $request->rent ?? 0,
                    'electricity_bill' => $request->electricity_bill ?? 0,
                    'gas_bill' => $request->gas_bill ?? 0,
                    'water_bill' => $request->water_bill ?? 0,
                    'other_bills' => $request->other_bills ?? 0,
                ]
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Expenses updated successfully',
                'expense' => $expense
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
