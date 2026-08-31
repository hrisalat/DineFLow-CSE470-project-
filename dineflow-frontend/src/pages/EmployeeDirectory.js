import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';

const EmployeeDirectory = ({ role }) => {
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPos, setFilterPos] = useState('All');

    // Payroll state
    const [payrollData, setPayrollData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [finePerDay, setFinePerDay] = useState(0);
    const [fineInput, setFineInput] = useState('');
    const [showPayModal, setShowPayModal] = useState(null); // holds employee payroll info

    const res = JSON.parse(localStorage.getItem('restaurant')) || {};

    const fetchEmployees = useCallback(async () => {
        if (res.id) {
            try {
                const r = await axios.get(`http://localhost:8000/api/employees/${res.id}`);
                setEmployees(r.data);
            } catch (e) {
                console.error("Error fetching employees", e);
            }
        }
    }, [res.id]);

    const fetchPayrollSummary = useCallback(async () => {
        if (res.id && selectedMonth) {
            try {
                const r = await axios.get(`http://localhost:8000/api/payroll/${res.id}/${selectedMonth}`);
                setPayrollData(r.data);
            } catch (e) {
                console.error("Error fetching payroll", e);
            }
        }
    }, [res.id, selectedMonth]);

    const fetchFineSetting = useCallback(async () => {
        if (res.id) {
            try {
                const r = await axios.get(`http://localhost:8000/api/fine-setting/${res.id}`);
                setFinePerDay(parseFloat(r.data.fine_per_day) || 0);
                setFineInput(r.data.fine_per_day || '0');
            } catch (e) {
                console.error("Error fetching fine setting", e);
            }
        }
    }, [res.id]);

    useEffect(() => {
        fetchEmployees();
        fetchFineSetting();
    }, [fetchEmployees, fetchFineSetting]);

    useEffect(() => {
        fetchPayrollSummary();
    }, [fetchPayrollSummary]);

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        fd.append('restaurant_id', res.id);
        try {
            await axios.post('http://localhost:8000/api/employees/add', fd);
            setShowForm(false);
            fetchEmployees();
            fetchPayrollSummary();
        } catch (err) {
            // Updated error message to be more helpful
            const msg = err.response?.data?.message || "Check if email/phone is unique.";
            alert("Failed to add employee: " + msg);
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (window.confirm("Are you sure you want to remove this employee?")) {
            try {
                await axios.delete(`http://localhost:8000/api/employees/${id}`);
                setEmployees(employees.filter(emp => emp.id !== id));
                fetchPayrollSummary();
            } catch (err) {
                alert("Error deleting.");
            }
        }
    };

    const handleSaveFine = async () => {
        try {
            await axios.post('http://localhost:8000/api/fine-setting', {
                restaurant_id: res.id,
                fine_per_day: parseFloat(fineInput) || 0
            });
            setFinePerDay(parseFloat(fineInput) || 0);
            fetchPayrollSummary();
            alert('Fine per day updated successfully!');
        } catch (err) {
            alert('Failed to save fine setting.');
        }
    };

    const handlePayEmployee = async (empPayroll) => {
        try {
            await axios.post('http://localhost:8000/api/payroll/pay', {
                employee_id: empPayroll.employee_id,
                restaurant_id: res.id,
                month: selectedMonth
            });
            setShowPayModal(null);
            fetchPayrollSummary();
        } catch (err) {
            const msg = err.response?.data?.message || 'Payment failed.';
            alert(msg);
        }
    };

    const getPayrollForEmployee = (empId) => {
        return payrollData.find(p => p.employee_id === empId);
    };

    // Generate month options (last 12 months + current)
    const getMonthOptions = () => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push({ value: val, label });
        }
        return options;
    };

    const filtered = employees.filter(e =>
        (filterPos === 'All' || e.position.toLowerCase() === filterPos.toLowerCase()) &&
        (e.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pageStyles = {
        container: { fontFamily: 'Verdana, sans-serif', paddingTop: '100px', minHeight: '100vh', backgroundColor: '#f4f7f6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingBottom: '40px' },
        wideCard: { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '95%', maxWidth: '1100px' },
        headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
        filterRow: { display: 'flex', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #eee', flexWrap: 'wrap' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'Verdana' },
        addBtn: { backgroundColor: res.accent_color, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Verdana' },
        idBadge: { padding: '5px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: 'white', backgroundColor: res.accent_color },
        deleteBtn: { backgroundColor: '#ff4d4d', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginLeft: '15px' },
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
        label: { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '3px', display: 'block', marginTop: '10px' },
        payBtn: { backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Verdana', fontSize: '12px' },
        paidBadge: { backgroundColor: '#4caf50', color: 'white', padding: '8px 18px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', fontFamily: 'Verdana' },
        salaryText: { fontSize: '13px', color: '#333', fontWeight: 'bold' },
        fineCard: { background: 'white', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '95%', maxWidth: '1100px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' },
    };

    return (
        <div style={pageStyles.container}>
            <TopBar role={role} />

            {/* Fine Setting Card */}
            <div style={pageStyles.fineCard}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>⚙️ Fine Settings</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '13px', color: '#555' }}>Fine Per Absent Day (৳):</label>
                    <input
                        type="number"
                        value={fineInput}
                        onChange={e => setFineInput(e.target.value)}
                        style={{ ...pageStyles.input, width: '120px', padding: '8px 12px' }}
                        min="0"
                    />
                    <button
                        onClick={handleSaveFine}
                        style={{ ...pageStyles.addBtn, padding: '8px 20px', borderRadius: '8px', fontSize: '13px' }}
                    >
                        SAVE
                    </button>
                </div>
                <span style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
                    Current: ৳{finePerDay} / absent day
                </span>
            </div>

            {/* Main Employee Directory Card */}
            <div style={pageStyles.wideCard}>
                <div style={pageStyles.headerRow}>
                    <h2 style={{ margin: 0 }}>Employee Directory</h2>
                    <button style={pageStyles.addBtn} onClick={() => setShowForm(true)}>
                        + ADD EMPLOYEE
                    </button>
                </div>

                <div style={pageStyles.filterRow}>
                    <input 
                        placeholder="Search by name..." 
                        style={{ ...pageStyles.input, flex: 2 }} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                    <select 
                        style={{ ...pageStyles.input, flex: 1 }} 
                        onChange={e => setFilterPos(e.target.value)}
                    >
                        <option value="All">All Roles</option>
                        <option value="manager">Manager</option>
                        <option value="chef">Chef</option>
                        <option value="waiter">Waiter</option>
                        <option value="cleaner">Cleaner</option>
                    </select>
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        style={{ ...pageStyles.input, flex: 1 }}
                    >
                        {getMonthOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {filtered.map(emp => {
                    const payroll = getPayrollForEmployee(emp.id);
                    return (
                        <div key={emp.id} style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee', gap: '15px' }}>
                            <img 
                                src={`http://localhost:8000/storage/${emp.photo}`} 
                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} 
                                onError={e => e.target.src="https://via.placeholder.com/60"} 
                                alt="p" 
                            />
                            <div style={{ flex: 1 }}>
                                <strong style={{ fontSize: '16px' }}>{emp.name}</strong> 
                                <span style={{ fontSize: '12px', color: '#888', marginLeft: '10px' }}>
                                    ({emp.position.toUpperCase()})
                                </span><br />
                                <small style={{ color: '#666' }}>{emp.email}</small>
                            </div>

                            {/* Salary Display */}
                            <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Salary</div>
                                <div style={pageStyles.salaryText}>৳{Number(emp.salary).toLocaleString()}</div>
                            </div>

                            {/* Absence Info */}
                            {payroll && (
                                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                    <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Absent</div>
                                    <div style={{ fontSize: '13px', color: payroll.absent_days > 0 ? '#e53935' : '#4caf50', fontWeight: 'bold' }}>
                                        {payroll.absent_days} day{payroll.absent_days !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            )}

                            {/* Pay Button / Paid Badge */}
                            <div style={{ textAlign: 'center', minWidth: '90px' }}>
                                {payroll && payroll.is_paid ? (
                                    <div style={pageStyles.paidBadge}>✅ PAID</div>
                                ) : (
                                    <button
                                        style={pageStyles.payBtn}
                                        onClick={() => setShowPayModal(payroll || { employee_id: emp.id, name: emp.name, salary: emp.salary, absent_days: 0, fine_per_day: finePerDay, total_fine: 0, net_salary: emp.salary })}
                                    >
                                        💰 PAY
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={pageStyles.idBadge}>ID: {emp.unique_id}</div>
                                {(role === 'Admin' || emp.position.toLowerCase() !== 'manager') && (
                                    <button style={pageStyles.deleteBtn} onClick={() => handleDeleteEmployee(emp.id)}>🗑️</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pay Confirmation Modal */}
            {showPayModal && (
                <div style={pageStyles.modalOverlay}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '420px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>💰 Confirm Salary Payment</h3>

                        <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px' }}>
                            {showPayModal.name}
                        </div>

                        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                <span style={{ color: '#666' }}>Month</span>
                                <strong>{selectedMonth}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                <span style={{ color: '#666' }}>Base Salary</span>
                                <strong>৳{Number(showPayModal.salary).toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                <span style={{ color: '#666' }}>Scheduled Days</span>
                                <strong>{showPayModal.scheduled_days ?? 'N/A'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                <span style={{ color: '#666' }}>Present Days</span>
                                <strong>{showPayModal.present_days ?? 'N/A'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                <span style={{ color: '#666' }}>Absent Days</span>
                                <strong style={{ color: showPayModal.absent_days > 0 ? '#e53935' : '#4caf50' }}>
                                    {showPayModal.absent_days}
                                </strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                <span style={{ color: '#666' }}>Fine/Day</span>
                                <strong>৳{Number(showPayModal.fine_per_day).toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee', color: '#e53935' }}>
                                <span>Total Fine Deduction</span>
                                <strong>- ৳{Number(showPayModal.total_fine).toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '17px' }}>
                                <span style={{ fontWeight: 'bold' }}>Net Payable</span>
                                <strong style={{ color: '#2e7d32' }}>
                                    ৳{Number(Math.max(0, showPayModal.net_salary)).toLocaleString()}
                                </strong>
                            </div>
                        </div>

                        <button
                            onClick={() => handlePayEmployee(showPayModal)}
                            style={{ ...pageStyles.addBtn, width: '100%', borderRadius: '8px', padding: '14px', fontSize: '15px' }}
                        >
                            CONFIRM PAYMENT
                        </button>
                        <button
                            onClick={() => setShowPayModal(null)}
                            style={{ width: '100%', padding: '12px', background: '#444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '5px', fontFamily: 'Verdana' }}
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {showForm && (
                <div style={pageStyles.modalOverlay}>
                    <form style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }} onSubmit={handleAddEmployee}>
                        <h3 style={{ marginTop: 0 }}>Add New Employee</h3>
                        
                        <label style={pageStyles.label}>Full Name</label>
                        <input name="name" style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }} required />
                        
                        <label style={pageStyles.label}>Email Address</label>
                        <input name="email" type="email" style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }} required />
                        
                        <label style={pageStyles.label}>Phone Number</label>
                        <input name="phone" style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }} required />
                        
                        <label style={pageStyles.label}>NID / Birth Cert</label>
                        <input name="nid" style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }} required />
                        
                        <label style={pageStyles.label}>Position</label>
                        <select name="position" style={{ ...pageStyles.input, width: '100%' }}>
                            {role === 'Admin' && <option value="manager">Manager</option>}
                            <option value="chef">Chef</option>
                            <option value="waiter">Waiter</option>
                            <option value="cleaner">Cleaner</option>
                        </select>
                        
                        <label style={pageStyles.label}>Monthly Salary</label>
                        <input name="salary" type="number" style={{ ...pageStyles.input, width: '100%', boxSizing: 'border-box' }} required />
                        
                        <label style={pageStyles.label}>Photo</label>
                        <input type="file" name="photo" style={{ marginBottom: '15px' }} />
                        
                        <button type="submit" style={{ ...pageStyles.addBtn, width: '100%', borderRadius: '8px' }}>SAVE</button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ width: '100%', padding: '12px', background: '#444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '5px', fontFamily: 'Verdana' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EmployeeDirectory;