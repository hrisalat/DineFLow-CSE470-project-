import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const Inventory = () => {
    // 1. We get the restaurant/user data fresh from storage
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showModal, setShowModal] = useState(false);
    
    // 2. State to track the dynamic role for the TopBar
    const [currentRole, setCurrentRole] = useState("Admin");

    const [form, setForm] = useState({ 
        item_name: '', 
        quantity: '', 
        unit: 'Pieces', 
        expiry_date: '', 
        purchase_price: '' 
    });

    useEffect(() => { 
        if (res.id) {
            // 3. DETECT ROLE: Check if the logged-in user is an employee
            if (res.position) {
                const pos = res.position.toLowerCase();
                if (pos === 'manager') {
                    setCurrentRole("Manager");
                } else {
                    setCurrentRole("Staff"); // Chef, Waiter, Cleaner
                }
            } else {
                setCurrentRole("Admin"); // If no position exists, it's the Owner
            }

            fetchItems(); 
        } else {
            console.error("Inventory Error: No Restaurant ID found. Try Logging out and back in.");
        }
    }, [res.id, res.position]);

    const fetchItems = async () => {
        try {
            const r = await axios.get(`http://localhost:8000/api/inventory/${res.id}`);
            setItems(r.data);
        } catch (err) {
            console.error("Fetch failed", err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!res.id) {
            alert("Error: Restaurant ID missing. Please log in again.");
            return;
        }
        const itemData = { restaurant_id: res.id, ...form };
        try {
            await axios.post('http://localhost:8000/api/inventory', itemData);
            alert("SUCCESS: Item Saved!");
            setShowModal(false);
            setForm({ item_name: '', quantity: '', unit: 'Pieces', expiry_date: '', purchase_price: '' });
            fetchItems(); 
        } catch (err) {
            const serverError = err.response?.data?.message || "Unknown Server Error";
            alert("BACKEND CRASHED: " + serverError);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this item?")) {
            try {
                const response = await axios.delete(`http://localhost:8000/api/inventory/${id}`);
                if (response.data.status === 'success') {
                    fetchItems(); 
                }
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    const filtered = items
        .filter(i => i.item_name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortBy === 'name' 
            ? a.item_name.localeCompare(b.item_name) 
            : a.purchase_price - b.purchase_price
        );

    return (
        <div style={styles.app}>
            {/* 4. PASS THE CORRECT DETECTED ROLE TO TOPBAR */}
            <TopBar role={currentRole} />
            
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1000px', alignItems: 'center' }}>
                    <h1 style={{ fontFamily: 'Verdana' }}>Inventory</h1>
                    <button onClick={() => setShowModal(true)} style={{ ...styles.button, width: 'auto', padding: '10px 30px', backgroundColor: res.accent_color, borderRadius: '50px' }}>
                        + ADD ITEMS
                    </button>
                </div>

                <div style={{ ...styles.wideCard, display: 'flex', gap: '20px', padding: '15px', marginBottom: '20px', marginTop: '20px' }}>
                    <input placeholder="Search items..." style={{ ...styles.input, margin: 0, flex: 3 }} onChange={e => setSearchTerm(e.target.value)} />
                    <select style={{ ...styles.input, margin: 0, flex: 1 }} onChange={e => setSortBy(e.target.value)}>
                        <option value="name">Sort by Name (A-Z)</option>
                        <option value="price">Sort by Price</option>
                    </select>
                </div>

                <div style={styles.wideCard}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Verdana' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666', fontSize: '12px' }}>
                                <th style={pad}>NAME</th>
                                <th style={pad}>QUANTITY</th>
                                <th style={pad}>UNIT</th>
                                <th style={pad}>EXPIRY DATE</th>
                                <th style={pad}>PURCHASE PRICE</th>
                                <th style={pad}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? (
                                filtered.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={pad}>{item.item_name}</td>
                                        <td style={pad}>{item.quantity}</td>
                                        <td style={pad}>{item.unit || "---"}</td> 
                                        <td style={pad}>{item.expiry_date}</td>
                                        <td style={pad}>৳{item.purchase_price}</td>
                                        <td style={pad}>
                                            <button onClick={() => handleDelete(item.id)} style={{ background: '', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px' }}>❌</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                        No items found. Click "+ ADD ITEMS" to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <form style={styles.card} onSubmit={handleSave}>
                        <h3 style={{marginTop: 0}}>Add New Item</h3>
                        <label style={labelStyle}>Item Name</label>
                        <input style={styles.input} value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} required />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Quantity</label>
                                <input type="number" style={styles.input} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Unit</label>
                                <select style={styles.input} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                    <option value="Pieces">Pieces</option>
                                    <option value="gm">gm</option>
                                    <option value="Kg">Kg</option>
                                    <option value="L">L</option>
                                    <option value="mL">mL</option>
                                    <option value="lbs">lbs</option>
                                    <option value="oz">oz</option>
                                </select>
                            </div>
                        </div>
                        <label style={labelStyle}>Expiry Date</label>
                        <input type="date" style={styles.input} value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} required />
                        <label style={labelStyle}>Purchase Price (৳)</label>
                        <input type="number" style={styles.input} value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} required />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, borderRadius: '50px' }}>SAVE ITEM</button>
                        <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.button, background: '#444', borderRadius: '50px' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const pad = { padding: '15px' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', display: 'block', marginTop: '10px' };

export default Inventory;