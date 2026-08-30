import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const WasteManagement = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [wasteItems, setWasteItems] = useState([]); // Expired Inventory
    const [customerWastes, setCustomerWastes] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ menu_item_id: '', quantity: '', date: new Date().toISOString().split('T')[0] });

    // --- ROBUST FETCH DATA LOGIC ---
    const fetchData = useCallback(async () => {
        if (!res.id) return;

        // 1. Fetch Expired Items
        axios.get(`http://localhost:8000/api/inventory/expired/${res.id}`)
            .then(expRes => setWasteItems(Array.isArray(expRes.data) ? expRes.data : []))
            .catch(err => console.error("Expired items fetch failed", err));

        // 2. Fetch Customer Waste Logs
        axios.get(`http://localhost:8000/api/waste/customer/${res.id}`)
            .then(custRes => setCustomerWastes(Array.isArray(custRes.data) ? custRes.data : []))
            .catch(err => console.error("Customer waste fetch failed", err));

        // 3. Fetch Menu Items for dropdown
        axios.get(`http://localhost:8000/api/menu/${res.id}`)
            .then(menuRes => {
                if (Array.isArray(menuRes.data)) {
                    const allItems = menuRes.data.flatMap(cat => cat.items || []);
                    setMenuItems(allItems);
                }
            })
            .catch(err => console.error("Menu items fetch failed", err));
    }, [res.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveWaste = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/waste/customer', { ...form, restaurant_id: res.id });
            setShowModal(false);
            setForm({ ...form, menu_item_id: '', quantity: '' });
            fetchData(); 
        } catch (err) { alert("Failed to log waste"); }
    };

    const totalLoss = wasteItems.reduce((acc, item) => acc + (parseFloat(item.purchase_price) * parseFloat(item.quantity)), 0);

    return (
        <div style={styles.app}>
            <TopBar role={res.position || "Admin"} />
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1100px', alignItems: 'center' }}>
                    <h1 style={{ fontFamily: 'Verdana', color: '#ff4d4d' }}>Waste Management</h1>
                    <button 
                        onClick={() => setShowModal(true)} 
                        style={{ ...styles.button, width: 'auto', padding: '12px 25px', backgroundColor: res.accent_color, borderRadius: '50px' }}
                    >
                        + LOG CUSTOMER WASTE
                    </button>
                </div>

                {/* TABLE 1: EXPIRED INVENTORY */}
                <div style={{ ...styles.wideCard, marginTop: '30px', borderLeft: '8px solid #ff4d4d' }}>
                    <h3>Expired Ingredients (Automatic)</h3>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={thRow}><th>ITEM NAME</th><th>EXPIRED ON</th><th>QUANTITY LOST</th><th>ESTIMATED LOSS</th></tr>
                        </thead>
                        <tbody>
                            {wasteItems.length > 0 ? (
                                wasteItems.map(item => (
                                    <tr key={item.id} style={trStyle}>
                                        <td style={pad}><strong>{item.item_name}</strong></td>
                                        <td style={{ color: 'red' }}>{item.expiry_date}</td>
                                        <td>{item.quantity} {item.unit}</td>
                                        <td>৳{(item.purchase_price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No expired waste found today.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* TABLE 2: CUSTOMER WASTE LOG */}
                <div style={{ ...styles.wideCard, marginTop: '40px', borderLeft: `8px solid ${res.accent_color}` }}>
                    <h3>Customer Food Waste (Manual Log)</h3>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={thRow}><th>DISH NAME</th><th>QTY</th><th>DATE</th><th>ACTION</th></tr>
                        </thead>
                        <tbody>
                            {customerWastes.map(w => (
                                <tr key={w.id} style={trStyle}>
                                    <td style={pad}>{w.menu_item?.name || 'Item'}</td>
                                    <td>{w.quantity} Plate(s)</td>
                                    <td>{w.date}</td>
                                    <td>
                                        <button onClick={async () => { if(window.confirm("Delete?")) { await axios.delete(`http://localhost:8000/api/waste/customer/${w.id}`); fetchData(); } }} style={delBtn}>❌</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={footerStyle}>
                    <h2 style={{ margin: 0 }}>Total Inventory Loss: <span style={{ color: '#ff4d4d' }}>৳{totalLoss.toFixed(2)}</span></h2>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleSaveWaste}>
                        <h3>Log Customer Waste</h3>
                        <label style={lbl}>Select Wasted Dish</label>
                        <select 
                            style={styles.input} 
                            value={form.menu_item_id}
                            onChange={e => setForm({...form, menu_item_id: e.target.value})} 
                            required
                        >
                            <option value="">Select dish...</option>
                            {menuItems.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>

                        <label style={lbl}>Quantity (Plates)</label>
                        <input type="number" style={styles.input} onChange={e => setForm({...form, quantity: e.target.value})} required />
                        
                        <label style={lbl}>Date</label>
                        <input type="date" style={styles.input} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                        
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color }}>SAVE LOG</button>
                        <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.button, background: '#444' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const pad = { padding: '15px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thRow = { textAlign: 'left', borderBottom: '2px solid #eee', color: '#888', fontSize: '11px', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #eee', fontSize: '14px' };
const footerStyle = { width: '100%', maxWidth: '1100px', marginTop: '30px', padding: '20px', background: 'white', borderRadius: '12px', textAlign: 'right', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const delBtn = { background: 'white', color: 'red', border: '1px solid #eee', borderRadius: '50%', cursor: 'pointer', width: '30px', height: '30px' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const lbl = { fontSize: '11px', fontWeight: 'bold', display: 'block', marginTop: '10px' };

export default WasteManagement;