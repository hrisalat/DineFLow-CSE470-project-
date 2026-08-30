import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const CustomerReservation = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const customer = JSON.parse(localStorage.getItem('customer')) || {};
    
    const [myBookings, setMyBookings] = useState([]);
    const [excluded, setExcluded] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: customer.name || '', phone: customer.phone || '', date: '', time: '' });

    const fetchMyData = useCallback(async () => {
        if (!res.id || !customer.phone) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/reservations/customer/${res.id}/${customer.phone}`);
            setMyBookings(response.data);
            // Fetch excluded times to disable them in dropdown
            const menuData = await axios.get(`http://localhost:8000/api/reservations/staff/${res.id}`);
            // Logic to get excluded times if available
        } catch (e) { console.error(e); }
    }, [res.id, customer.phone]);

    useEffect(() => { fetchMyData(); }, [fetchMyData]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/reservations', { ...form, restaurant_id: res.id });
            setShowModal(false);
            setForm({ ...form, date: '', time: '' });
            alert("Reservation Requested!");
            fetchMyData();
        } catch (err) { alert("Error saving reservation."); }
    };

    const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

    return (
        <div style={styles.app}>
            <TopBar role="Public" />
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1000px', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontFamily: 'Verdana' }}>My Reservations</h1>
                    <button onClick={() => setShowModal(true)} style={{ ...styles.button, width: 'auto', padding: '10px 30px', backgroundColor: res.accent_color, borderRadius: '50px' }}>
                        + BOOK A TABLE
                    </button>
                </div>

                <div style={styles.wideCard}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#888', fontSize: '12px' }}><th>DATE</th><th>TIME</th><th>ACTION</th></tr>
                        </thead>
                        <tbody>
                            {myBookings.length === 0 ? <tr><td colSpan="3" style={{padding:'20px', textAlign:'center'}}>No bookings found.</td></tr> : 
                                myBookings.map(rv => (
                                    <tr key={rv.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px 0' }}>{rv.date}</td>
                                        <td>{rv.time.substring(0,5)}</td>
                                        <td><button onClick={async () => { if(window.confirm("Cancel?")) { await axios.delete(`http://localhost:8000/api/reservations/${rv.id}`); fetchMyData(); } }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight:'bold' }}>Cancel</button></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD RESERVATION MODAL */}
            {showModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleSave}>
                        <h2>Book a Table</h2>
                        <input style={styles.input} value={form.name} placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} required />
                        <input style={styles.input} value={form.phone} placeholder="Phone" onChange={e => setForm({...form, phone: e.target.value})} required />
                        <input type="date" style={styles.input} onChange={e => setForm({...form, date: e.target.value})} required />
                        <select style={styles.input} onChange={e => setForm({...form, time: e.target.value})} required>
                            <option value="">Choose Time...</option>
                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, borderRadius: '50px' }}>CONFIRM</button>
                        <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.button, background: '#444', borderRadius: '50px', marginTop: '5px' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
export default CustomerReservation;