import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';

const EmployeeDirectory = ({ role }) => {
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPos, setFilterPos] = useState('All');

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

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        fd.append('restaurant_id', res.id);
        try {
            await axios.post('http://localhost:8000/api/employees/add', fd);
            setShowForm(false);
            fetchEmployees();
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
            } catch (err) {
                alert("Error deleting.");
            }
        }
    };

    const filtered = employees.filter(e =>
        (filterPos === 'All' || e.position.toLowerCase() === filterPos.toLowerCase()) &&
        (e.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pageStyles = {
        container: { fontFamily: 'Verdana, sans-serif', paddingTop: '100px', minHeight: '100vh', backgroundColor: '#f4f7f6', display: 'flex', flexDirection: 'column', alignItems: 'center' },
        wideCard: { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '95%', maxWidth: '1000px' },
        headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
        filterRow: { display: 'flex', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #eee' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'Verdana' },
        addBtn: { backgroundColor: res.accent_color, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Verdana' },
        idBadge: { padding: '5px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: 'white', backgroundColor: res.accent_color },
        deleteBtn: { backgroundColor: '#ff4d4d', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginLeft: '15px' },
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
        label: { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '3px', display: 'block', marginTop: '10px' }
    };

    return (
        <div style={pageStyles.container}>
            <TopBar role={role} />
            
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
                </div>

                {filtered.map(emp => (
                    <div key={emp.id} style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee', gap: '20px' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={pageStyles.idBadge}>ID: {emp.unique_id}</div>
                            {(role === 'Admin' || emp.position.toLowerCase() !== 'manager') && (
                                <button style={pageStyles.deleteBtn} onClick={() => handleDeleteEmployee(emp.id)}>🗑️</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

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