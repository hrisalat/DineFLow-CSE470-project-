import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const Inventory = () => {
    // 1. DATA AND STATE
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showModal, setShowModal] = useState(false);
    const [currentRole, setCurrentRole] = useState("Admin");

    const [form, setForm] = useState({ 
        item_name: '', 
        quantity: '', 
        unit: 'Pieces', 
        expiry_date: '', 
        purchase_price: '' 
    });

    // 2. UNIT-BASED THRESHOLD LOGIC
    const getStockStatus = (item) => {
        const qty = parseFloat(item.quantity || 0);
        const unit = item.unit?.toLowerCase();
        
        let threshold = 0;
        if (unit === 'kg') threshold = 1;
        else if (unit === 'pieces') threshold = 5;
        else if (unit === 'lbs') threshold = 3;
        else if (unit === 'l') threshold = 5;
        else if (unit === 'ml') threshold = 300;
        else if (unit === 'oz') threshold = 200;
        else if (unit === 'gm') threshold = 250;

        if (qty <= 0) return { label: "EMPTY", color: "#721c24", bg: "#f8d7da" };
        if (qty <= threshold) return { label: "LOW STOCK", color: "#856404", bg: "#fff3cd" };
        return { label: "OK", color: "#155724", bg: "#d4edda" };
    };

    // 3. FETCH DATA
    const fetchItems = useCallback(async () => {
        if (!res.id) return;
        try {
            const r = await axios.get(`http://localhost:8000/api/inventory/${res.id}`);
            setItems(r.data);
            
            // Detect role from position
            if (res.position) {
                const pos = res.position.toLowerCase();
                setCurrentRole(pos === 'manager' ? "Manager" : "Staff");
            } else {
                setCurrentRole("Admin");
            }
        } catch (err) {
            console.error("Fetch failed", err);
        }
    }, [res.id, res.position]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    // 4. ACTION HANDLERS
    const handleSave = async (e) => {
        e.preventDefault();
        if (!res.id) return alert("Log in again");
        try {
            await axios.post('http://localhost:8000/api/inventory', { ...form, restaurant_id: res.id });
            setShowModal(false);
            setForm({ item_name: '', quantity: '', unit: 'Pieces', expiry_date: '', purchase_price: '' });
            fetchItems();
        } catch (err) { alert("Error saving item"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this item?")) {
            try {
                await axios.delete(`http://localhost:8000/api/inventory/${id}`);
                fetchItems();
            } catch (err) { alert("Delete failed"); }
        }
    };

    const filtered = items
        .filter(i => i.item_name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortBy === 'name' ? a.item_name.localeCompare(b.item_name) : a.purchase_price - b.purchase_price);

    return (
        <div style={styles.app}>
            <TopBar role={currentRole} />
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1100px', alignItems: 'center' }}>
                    <h1 style={{ fontFamily: 'Verdana' }}>Inventory</h1>
                    <button onClick={() => setShowModal(true)} style={{ ...styles.button, width: 'auto', padding: '12px 30px', backgroundColor: res.accent_color, borderRadius: '50px' }}>
                        + ADD ITEMS
                    </button>
                </div>

                {/* SEARCH & SORT */}
                <div style={{ ...styles.wideCard, display: 'flex', gap: '20px', padding: '15px', marginBottom: '20px', marginTop: '20px' }}>
                    <input placeholder="Search items..." style={{ ...styles.input, margin: 0, flex: 3 }} onChange={e => setSearchTerm(e.target.value)} />
                    <select style={{ ...styles.input, margin: 0, flex: 1 }} onChange={e => setSortBy(e.target.value)}>
                        <option value="name">Sort by Name (A-Z)</option>
                        <option value="price">Sort by Price</option>
                    </select>
                </div>

                {/* TABLE */}
                <div style={styles.wideCard}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Verdana' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666', fontSize: '11px' }}>
                                <th style={pad}>NAME</th>
                                <th style={pad}>QUANTITY</th>
                                <th style={pad}>UNIT</th>
                                <th style={pad}>EXPIRY</th>
                                <th style={pad}>PRICE</th>
                                <th style={pad}>STATUS</th>
                                <th style={pad}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? (
                                filtered.map(item => {
                                    const status = getStockStatus(item);
                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee', backgroundColor: status.label !== "OK" ? '#fffaf0' : 'transparent' }}>
                                            <td style={pad}>{item.item_name}</td>
                                            <td style={{ ...pad, fontWeight: 'bold' }}>{item.quantity}</td>
                                            <td style={pad}>{item.unit}</td>
                                            <td style={pad}>{item.expiry_date}</td>
                                            <td style={pad}>৳{item.purchase_price}</td>
                                            <td style={pad}>
                                                <span style={{ padding: '4px 10px', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold', backgroundColor: status.bg, color: status.color, border: `1px solid ${status.color}` }}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td style={pad}>
                                                <button onClick={() => handleDelete(item.id)} style={{ background: 'white', color: '#ff4d4d', border: '1px solid #eee', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>❌</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No items found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD MODAL */}
            {showModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleSave}>
                        <h3 style={{marginTop: 0}}>Add New Item</h3>
                        <label style={lbl}>Name</label>
                        <input style={styles.input} onChange={e => setForm({ ...form, item_name: e.target.value })} required />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}><label style={lbl}>Qty</label><input type="number" style={styles.input} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></div>
                            <div style={{ flex: 1 }}><label style={lbl}>Unit</label><select style={styles.input} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                <option value="Pieces">Pieces</option><option value="gm">gm</option><option value="Kg">Kg</option><option value="L">L</option><option value="mL">mL</option><option value="lbs">lbs</option><option value="oz">oz</option>
                            </select></div>
                        </div>
                        <label style={lbl}>Expiry Date</label><input type="date" style={styles.input} onChange={e => setForm({ ...form, expiry_date: e.target.value })} required />
                        <label style={lbl}>Purchase Price</label><input type="number" style={styles.input} onChange={e => setForm({ ...form, purchase_price: e.target.value })} required />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, borderRadius: '50px' }}>SAVE ITEM</button>
                        <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.button, background: '#444', borderRadius: '50px' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const pad = { padding: '15px' };
const lbl = { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', display: 'block', marginTop: '10px' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };

export default Inventory;