import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const StaffReservation = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const isManager = res.position?.toLowerCase() === 'manager' || !res.position;
    
    const [allBookings, setAllBookings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', date: '', time: '' });

    const fetchAllData = useCallback(async () => {
        if (!res.id) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/reservations/staff/${res.id}`);
            setAllBookings(response.data);
        } catch (e) { console.error(e); }
    }, [res.id]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/reservations', { ...form, restaurant_id: res.id });
            setShowModal(false);
            setForm({ name: '', phone: '', date: '', time: '' });
            fetchAllData();
        } catch (err) { alert("Failed to add."); }
    };

    const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

    return (
        <div style={styles.app}>
            <TopBar role={res.position || "Admin"} />
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1000px', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>Table Management</h1>
                    <button onClick={() => setShowModal(true)} style={{ ...styles.button, width: 'auto', padding: '10px 30px', backgroundColor: res.accent_color, borderRadius: '50px' }}>
                        + ADD RESERVATION
                    </button>
                </div>

                <div style={styles.wideCard}>
                    <h3>All Pending Guest Arrivals</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', fontSize: '12px', color: '#888' }}><th>GUEST</th><th>PHONE</th><th>TIME</th><th>ACTION</th></tr>
                        </thead>
                        <tbody>
                            {allBookings.length === 0 ? <tr><td colSpan="4" style={{padding:'20px', textAlign:'center'}}>No pending guests.</td></tr> : 
                                allBookings.map(rv => (
                                    <tr key={rv.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px 0' }}><b>{rv.name}</b></td>
                                        <td>{rv.phone}</td>
                                        <td>{rv.date} @ {rv.time.substring(0,5)}</td>
                                        <td>
                                            <button onClick={async () => { await axios.delete(`http://localhost:8000/api/reservations/${rv.id}`); fetchAllData(); }} style={{ background: 'white', color: 'red', border: '1px solid #eee', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>❌</button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleSave}>
                        <h3>Staff Booking Form</h3>
                        <input style={styles.input} placeholder="Guest Name" onChange={e => setForm({...form, name: e.target.value})} required />
                        <input style={styles.input} placeholder="Guest Phone" onChange={e => setForm({...form, phone: e.target.value})} required />
                        <input type="date" style={styles.input} onChange={e => setForm({...form, date: e.target.value})} required />
                        <select style={styles.input} onChange={e => setForm({...form, time: e.target.value})} required>
                            <option value="">Select Time...</option>
                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color }}>SAVE BOOKING</button>
                        <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.button, background: '#444' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
export default StaffReservation;