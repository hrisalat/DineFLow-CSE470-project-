import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const Finances = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    const [currentRole, setCurrentRole] = useState("Admin");

    // Month filter
    const [selectedMonth, setSelectedMonth] = useState('all');

    // Data States
    const [orders, setOrders] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [summary, setSummary] = useState({
        total_revenue: 0,
        total_inventory_expense: 0,
        total_salary_expense: 0,
        total_operating_expense: 0,
        total_expenditure: 0,
        gross_profit: 0,
        net_profit: 0
    });

    // Rent and Bills form state
    const [expensesForm, setExpensesForm] = useState({
        rent: 0,
        electricity_bill: 0,
        gas_bill: 0,
        water_bill: 0,
        other_bills: 0
    });
    const [savingExpenses, setSavingExpenses] = useState(false);

    // Search filters for tables
    const [orderSearch, setOrderSearch] = useState('');
    const [invSearch, setInvSearch] = useState('');
    const [salarySearch, setSalarySearch] = useState('');

    // Detect role
    useEffect(() => {
        if (res.position) {
            const pos = res.position.toLowerCase();
            setCurrentRole(pos === 'manager' ? "Manager" : "Staff");
        } else {
            setCurrentRole("Admin");
        }
    }, [res.position]);

    // Generate Month Options (All time + Last 12 months)
    const getMonthOptions = () => {
        const options = [{ value: 'all', label: '📊 All Time' }];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push({ value: val, label });
        }
        return options;
    };

    // Fetch Summary & Data
    const fetchFinanceData = useCallback(async () => {
        if (!res.id) return;
        try {
            const url = `http://localhost:8000/api/finances/summary/${res.id}?month=${selectedMonth}`;
            const r = await axios.get(url);
            if (r.data.status === 'success') {
                setOrders(r.data.orders || []);
                setInventories(r.data.inventories || []);
                setSalaries(r.data.salaries || []);
                setSummary(r.data.summary || {});
                if (r.data.operating_expenses) {
                    setExpensesForm({
                        rent: r.data.operating_expenses.rent || 0,
                        electricity_bill: r.data.operating_expenses.electricity_bill || 0,
                        gas_bill: r.data.operating_expenses.gas_bill || 0,
                        water_bill: r.data.operating_expenses.water_bill || 0,
                        other_bills: r.data.operating_expenses.other_bills || 0
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch finance summary", err);
        }
    }, [res.id, selectedMonth]);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData]);

    // Save Rent & Bills
    const handleSaveExpenses = async (e) => {
        e.preventDefault();
        if (!res.id) return;
        setSavingExpenses(true);
        try {
            await axios.post('http://localhost:8000/api/finances/expenses', {
                restaurant_id: res.id,
                month: selectedMonth === 'all' ? null : selectedMonth,
                rent: parseFloat(expensesForm.rent) || 0,
                electricity_bill: parseFloat(expensesForm.electricity_bill) || 0,
                gas_bill: parseFloat(expensesForm.gas_bill) || 0,
                water_bill: parseFloat(expensesForm.water_bill) || 0,
                other_bills: parseFloat(expensesForm.other_bills) || 0
            });
            alert("Rent and Bills saved successfully!");
            fetchFinanceData();
        } catch (err) {
            alert("Failed to save overhead expenses.");
        } finally {
            setSavingExpenses(false);
        }
    };

    // Filtered lists
    const filteredOrders = orders.filter(o => 
        (o.customer_name && o.customer_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.customer_phone && o.customer_phone.includes(orderSearch)) ||
        (o.id && String(o.id).includes(orderSearch)) ||
        (o.payment_method && o.payment_method.toLowerCase().includes(orderSearch.toLowerCase()))
    );

    const filteredInventories = inventories.filter(i =>
        i.item_name && i.item_name.toLowerCase().includes(invSearch.toLowerCase())
    );

    const filteredSalaries = salaries.filter(s =>
        (s.employee?.name && s.employee.name.toLowerCase().includes(salarySearch.toLowerCase())) ||
        (s.employee?.position && s.employee.position.toLowerCase().includes(salarySearch.toLowerCase())) ||
        (s.month && s.month.includes(salarySearch))
    );

    const totalRentBills = (parseFloat(expensesForm.rent) || 0) +
        (parseFloat(expensesForm.electricity_bill) || 0) +
        (parseFloat(expensesForm.gas_bill) || 0) +
        (parseFloat(expensesForm.water_bill) || 0) +
        (parseFloat(expensesForm.other_bills) || 0);

    const pageStyles = {
        container: { fontFamily: 'Verdana, sans-serif', paddingTop: '90px', minHeight: '100vh', backgroundColor: '#f4f7f6', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '60px' },
        wrapper: { width: '95%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '25px' },
        headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
        title: { fontSize: '28px', fontWeight: 'bold', color: '#222', margin: 0 },
        monthSelect: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', fontFamily: 'Verdana', backgroundColor: 'white', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },
        
        // KPI Grid
        kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' },
        kpiCard: (borderColor, bgColor) => ({
            background: bgColor || 'white',
            padding: '22px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
            borderLeft: `5px solid ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }),
        kpiLabel: { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px' },
        kpiValue: (color) => ({ fontSize: '24px', fontWeight: 'bold', color: color || '#111', margin: 0 }),
        kpiSubtext: { fontSize: '11px', color: '#888' },

        // Section Cards
        card: { background: 'white', padding: '25px 30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
        cardTitle: { fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' },
        
        // Input styles
        input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'Verdana', fontSize: '13px', outline: 'none' },
        btnSave: { backgroundColor: res.accent_color || '#6366f1', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Verdana', fontSize: '13px', transition: '0.2s' },

        // Combined Box
        combinedBox: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '25px 30px', borderRadius: '14px', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' },
        
        // Tables
        table: { width: '100%', borderCollapse: 'collapse', fontFamily: 'Verdana', fontSize: '13px' },
        th: { padding: '12px 14px', textAlign: 'left', borderBottom: '2px solid #eee', color: '#555', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
        td: { padding: '12px 14px', borderBottom: '1px solid #f0f0f0', color: '#333' },
        totalBanner: (bg, color) => ({
            marginTop: '15px',
            padding: '14px 20px',
            backgroundColor: bg || '#f8fafc',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '15px',
            color: color || '#1e293b',
            border: '1px solid #e2e8f0'
        })
    };

    return (
        <div style={pageStyles.container}>
            <TopBar role={currentRole} />

            <div style={pageStyles.wrapper}>
                
                {/* 1. TOP HEADER & MONTH FILTER */}
                <div style={pageStyles.headerRow}>
                    <div>
                        <h1 style={pageStyles.title}>💰 Financial Overview</h1>
                        <span style={{ fontSize: '13px', color: '#666' }}>
                            Comprehensive profit, loss, revenue, and expenditure analytics
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Filter Period:</span>
                        <select 
                            style={pageStyles.monthSelect} 
                            value={selectedMonth} 
                            onChange={e => setSelectedMonth(e.target.value)}
                        >
                            {getMonthOptions().map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 2. PRIMARY KPI CARDS (REVENUE, GROSS PROFIT, EXPENDITURE, NET PROFIT) */}
                <div style={pageStyles.kpiGrid}>
                    
                    {/* Total Revenue */}
                    <div style={pageStyles.kpiCard('#10b981', '#f0fdf4')}>
                        <span style={pageStyles.kpiLabel}>📈 Total Revenue</span>
                        <h2 style={pageStyles.kpiValue('#047857')}>৳{Number(summary.total_revenue || 0).toLocaleString()}</h2>
                        <span style={pageStyles.kpiSubtext}>{orders.length} customer order{orders.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Gross Profit */}
                    <div style={pageStyles.kpiCard('#3b82f6', '#eff6ff')}>
                        <span style={pageStyles.kpiLabel}>💼 Gross Profit</span>
                        <h2 style={pageStyles.kpiValue('#1d4ed8')}>৳{Number(summary.gross_profit || 0).toLocaleString()}</h2>
                        <span style={pageStyles.kpiSubtext}>Revenue − Raw Inventory COGS</span>
                    </div>

                    {/* Total Expenditure */}
                    <div style={pageStyles.kpiCard('#ef4444', '#fef2f2')}>
                        <span style={pageStyles.kpiLabel}>💸 Total Expenditure</span>
                        <h2 style={pageStyles.kpiValue('#b91c1c')}>৳{Number(summary.total_expenditure || 0).toLocaleString()}</h2>
                        <span style={pageStyles.kpiSubtext}>Inventory + Salaries + Rent + Bills</span>
                    </div>

                    {/* Net Profit */}
                    <div style={pageStyles.kpiCard(summary.net_profit >= 0 ? '#10b981' : '#dc2626', summary.net_profit >= 0 ? '#ecfdf5' : '#fff1f2')}>
                        <span style={pageStyles.kpiLabel}>🏆 Net Profit</span>
                        <h2 style={pageStyles.kpiValue(summary.net_profit >= 0 ? '#065f46' : '#991b1b')}>
                            ৳{Number(summary.net_profit || 0).toLocaleString()}
                        </h2>
                        <span style={pageStyles.kpiSubtext}>
                            {summary.total_revenue > 0 ? `${((summary.net_profit / summary.total_revenue) * 100).toFixed(1)}% margin` : 'Revenue − Total Expenses'}
                        </span>
                    </div>

                </div>

                {/* 3. RENT & BILLS BOXES (OVERHEAD EXPENSES) */}
                <div style={pageStyles.card}>
                    <div style={pageStyles.cardHeader}>
                        <div>
                            <h3 style={pageStyles.cardTitle}>🏢 Rent & Utility Overhead Expenses</h3>
                            <span style={{ fontSize: '12px', color: '#777' }}>
                                Enter fixed overhead costs for {selectedMonth === 'all' ? 'general operations' : selectedMonth}
                            </span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px' }}>
                            Total Rent & Bills: ৳{totalRentBills.toLocaleString()}
                        </span>
                    </div>

                    <form onSubmit={handleSaveExpenses}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '5px' }}>
                                    🏢 Shop Rent (৳)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={expensesForm.rent}
                                    onChange={e => setExpensesForm({ ...expensesForm, rent: e.target.value })}
                                    style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '5px' }}>
                                    ⚡ Electricity Bill (৳)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={expensesForm.electricity_bill}
                                    onChange={e => setExpensesForm({ ...expensesForm, electricity_bill: e.target.value })}
                                    style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '5px' }}>
                                    💧 Water Bill (৳)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={expensesForm.water_bill}
                                    onChange={e => setExpensesForm({ ...expensesForm, water_bill: e.target.value })}
                                    style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '5px' }}>
                                    🔥 Gas Bill (৳)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={expensesForm.gas_bill}
                                    onChange={e => setExpensesForm({ ...expensesForm, gas_bill: e.target.value })}
                                    style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '5px' }}>
                                    🛠️ Maintenance / Other (৳)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={expensesForm.other_bills}
                                    onChange={e => setExpensesForm({ ...expensesForm, other_bills: e.target.value })}
                                    style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={savingExpenses} style={pageStyles.btnSave}>
                                {savingExpenses ? 'SAVING...' : '💾 SAVE OVERHEAD EXPENSES'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 4. COMBINED TOTAL EXPENDITURE SUMMARY BREAKDOWN */}
                <div style={pageStyles.combinedBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📊 Combined Total Expenditure Breakdown
                        </h3>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171' }}>
                            Total: ৳{Number(summary.total_expenditure || 0).toLocaleString()}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase' }}>1. Raw Inventory Purchases</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px', color: '#fbbf24' }}>
                                ৳{Number(summary.total_inventory_expense || 0).toLocaleString()}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase' }}>2. Paid Employee Salaries</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px', color: '#60a5fa' }}>
                                ৳{Number(summary.total_salary_expense || 0).toLocaleString()}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase' }}>3. Rent & Utility Bills</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px', color: '#a78bfa' }}>
                                ৳{Number(summary.total_operating_expense || 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. TABLE 1: CUSTOMER ORDERS & TOTAL REVENUE */}
                <div style={pageStyles.card}>
                    <div style={pageStyles.cardHeader}>
                        <div>
                            <h3 style={pageStyles.cardTitle}>🛒 Customer Orders & Sales Revenue</h3>
                            <span style={{ fontSize: '12px', color: '#777' }}>All completed and confirmed orders from customers</span>
                        </div>
                        <input
                            placeholder="Search orders by customer / phone / ID..."
                            value={orderSearch}
                            onChange={e => setOrderSearch(e.target.value)}
                            style={{ ...pageStyles.input, width: '280px' }}
                        />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={pageStyles.table}>
                            <thead>
                                <tr>
                                    <th style={pageStyles.th}>Order #</th>
                                    <th style={pageStyles.th}>Customer</th>
                                    <th style={pageStyles.th}>Phone</th>
                                    <th style={pageStyles.th}>Type</th>
                                    <th style={pageStyles.th}>Payment</th>
                                    <th style={pageStyles.th}>Status</th>
                                    <th style={pageStyles.th}>Date & Time</th>
                                    <th style={{ ...pageStyles.th, textAlign: 'right' }}>Price (৳)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <tr key={order.id}>
                                            <td style={{ ...pageStyles.td, fontWeight: 'bold' }}>#{order.id}</td>
                                            <td style={pageStyles.td}>{order.customer_name || 'Walk-in Customer'}</td>
                                            <td style={pageStyles.td}>{order.customer_phone || '—'}</td>
                                            <td style={pageStyles.td}>
                                                <span style={{ textTransform: 'capitalize', padding: '3px 8px', borderRadius: '12px', background: '#f1f5f9', fontSize: '11px', fontWeight: 'bold' }}>
                                                    {order.service_type || 'dine-in'}
                                                </span>
                                            </td>
                                            <td style={pageStyles.td}>
                                                <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', color: order.payment_method === 'bkash' ? '#e11d48' : '#059669' }}>
                                                    {order.payment_method || 'CASH'}
                                                </span>
                                            </td>
                                            <td style={pageStyles.td}>
                                                <span style={{ padding: '3px 8px', borderRadius: '12px', background: order.status === 'Completed' || order.status === 'confirmed' ? '#dcfce7' : '#fef9c3', color: order.status === 'Completed' || order.status === 'confirmed' ? '#15803d' : '#a16207', fontSize: '11px', fontWeight: 'bold' }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={pageStyles.td}>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</td>
                                            <td style={{ ...pageStyles.td, textAlign: 'right', fontWeight: 'bold', color: '#047857' }}>
                                                ৳{Number(order.total_price).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                                            No customer orders found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Total Revenue Below Orders Table */}
                    <div style={pageStyles.totalBanner('#ecfdf5', '#065f46')}>
                        <span>📊 TOTAL CUSTOMER REVENUE:</span>
                        <span style={{ fontSize: '18px' }}>৳{Number(summary.total_revenue || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* 6. TABLE 2: RAW INVENTORY EXPENSES */}
                <div style={pageStyles.card}>
                    <div style={pageStyles.cardHeader}>
                        <div>
                            <h3 style={pageStyles.cardTitle}>📦 Raw Inventory Purchases & Expenses</h3>
                            <span style={{ fontSize: '12px', color: '#777' }}>Ingredients and raw stock materials procured</span>
                        </div>
                        <input
                            placeholder="Search inventory items..."
                            value={invSearch}
                            onChange={e => setInvSearch(e.target.value)}
                            style={{ ...pageStyles.input, width: '250px' }}
                        />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={pageStyles.table}>
                            <thead>
                                <tr>
                                    <th style={pageStyles.th}>Item Name</th>
                                    <th style={pageStyles.th}>Quantity</th>
                                    <th style={pageStyles.th}>Unit</th>
                                    <th style={pageStyles.th}>Expiry Date</th>
                                    <th style={pageStyles.th}>Purchase Date</th>
                                    <th style={{ ...pageStyles.th, textAlign: 'right' }}>Expense (৳)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventories.length > 0 ? (
                                    filteredInventories.map(item => (
                                        <tr key={item.id}>
                                            <td style={{ ...pageStyles.td, fontWeight: 'bold' }}>{item.item_name}</td>
                                            <td style={pageStyles.td}>{item.quantity}</td>
                                            <td style={pageStyles.td}>{item.unit}</td>
                                            <td style={pageStyles.td}>{item.expiry_date || '—'}</td>
                                            <td style={pageStyles.td}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                                            <td style={{ ...pageStyles.td, textAlign: 'right', fontWeight: 'bold', color: '#b91c1c' }}>
                                                ৳{Number(item.purchase_price).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                                            No raw inventory purchase entries found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Total Raw Inventory Expense Below Table */}
                    <div style={pageStyles.totalBanner('#fef2f2', '#991b1b')}>
                        <span>📦 TOTAL RAW INVENTORY EXPENSE:</span>
                        <span style={{ fontSize: '18px' }}>৳{Number(summary.total_inventory_expense || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* 7. TABLE 3: PAID EMPLOYEE SALARIES */}
                <div style={pageStyles.card}>
                    <div style={pageStyles.cardHeader}>
                        <div>
                            <h3 style={pageStyles.cardTitle}>👥 Paid Employee Salaries</h3>
                            <span style={{ fontSize: '12px', color: '#777' }}>Disbursed staff payroll with absence deductions</span>
                        </div>
                        <input
                            placeholder="Search employees or month..."
                            value={salarySearch}
                            onChange={e => setSalarySearch(e.target.value)}
                            style={{ ...pageStyles.input, width: '250px' }}
                        />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={pageStyles.table}>
                            <thead>
                                <tr>
                                    <th style={pageStyles.th}>Employee</th>
                                    <th style={pageStyles.th}>Role / Position</th>
                                    <th style={pageStyles.th}>ID Badge</th>
                                    <th style={pageStyles.th}>Salary Month</th>
                                    <th style={pageStyles.th}>Base Salary (৳)</th>
                                    <th style={pageStyles.th}>Absence / Fines</th>
                                    <th style={pageStyles.th}>Paid Date</th>
                                    <th style={{ ...pageStyles.th, textAlign: 'right' }}>Net Paid (৳)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalaries.length > 0 ? (
                                    filteredSalaries.map(sal => (
                                        <tr key={sal.id}>
                                            <td style={{ ...pageStyles.td, fontWeight: 'bold' }}>{sal.employee?.name || 'Unknown Employee'}</td>
                                            <td style={pageStyles.td}>
                                                <span style={{ textTransform: 'uppercase', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
                                                    {sal.employee?.position || 'Staff'}
                                                </span>
                                            </td>
                                            <td style={pageStyles.td}>
                                                <span style={{ padding: '3px 8px', borderRadius: '12px', background: res.accent_color || '#6366f1', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                                                    {sal.employee?.unique_id || '—'}
                                                </span>
                                            </td>
                                            <td style={{ ...pageStyles.td, fontWeight: 'bold' }}>{sal.month}</td>
                                            <td style={pageStyles.td}>৳{Number(sal.base_salary).toLocaleString()}</td>
                                            <td style={pageStyles.td}>
                                                {sal.absent_days > 0 ? (
                                                    <span style={{ color: '#dc2626', fontSize: '12px' }}>
                                                        {sal.absent_days}d (-৳{Number(sal.total_fine).toLocaleString()})
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#16a34a', fontSize: '12px' }}>0 days</span>
                                                )}
                                            </td>
                                            <td style={pageStyles.td}>{sal.paid_at ? new Date(sal.paid_at).toLocaleDateString() : '—'}</td>
                                            <td style={{ ...pageStyles.td, textAlign: 'right', fontWeight: 'bold', color: '#1d4ed8' }}>
                                                ৳{Number(sal.net_salary).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                                            No employee salary disbursements found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Total Paid Salaries Below Table */}
                    <div style={pageStyles.totalBanner('#eff6ff', '#1e40af')}>
                        <span>👥 TOTAL PAID SALARIES:</span>
                        <span style={{ fontSize: '18px' }}>৳{Number(summary.total_salary_expense || 0).toLocaleString()}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Finances;
