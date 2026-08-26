import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const StaffDashboard = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [assignments, setAssignments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [emailInp, setEmailInp] = useState('');

    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayDate = new Date().toISOString().split('T')[0];

    // --- NEW: Helper to get dates for the current week ---
    const getWeekDates = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - dayOfWeek);
        return [0, 1, 2, 3, 4, 5, 6].map(offset => {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + offset);
            return { 
                name: d.toLocaleDateString('en-US', { weekday: 'long' }), 
                date: d.toISOString().split('T')[0] 
            };
        });
    };

    const weekDays = getWeekDates();

    const fetchData = useCallback(async () => {
        if (!res.id) return;
        try {
            const [sRes, aRes] = await Promise.all([
                axios.get(`http://localhost:8000/api/schedules/${res.id}`),
                axios.get(`http://localhost:8000/api/attendance/${res.id}`)
            ]);
            setAssignments(sRes.data);
            setAttendance(aRes.data);
        } catch (err) { console.error("Fetch failed"); }
    }, [res.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCheckIn = async () => {
        try {
            const r = await axios.post('http://localhost:8000/api/attendance/mark', { email: emailInp });
            alert("Check-in successful! Welcome, " + r.data.name);
            setEmailInp('');
            fetchData();
        } catch (err) { alert("Email not recognized."); }
    };

    return (
        <div style={styles.app}>
            <TopBar role="Staff" />
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                <h1 style={{ fontFamily: 'Verdana' }}>My Workspace</h1>

                {/* ATTENDANCE BOX */}
                <div style={{ ...styles.wideCard, marginBottom: '30px', textAlign: 'center', padding: '30px' }}>
                    <h3>Mark Today's Attendance</h3>
                    <div style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto' }}>
                        <input style={styles.input} placeholder="Enter your work email" value={emailInp} onChange={e => setEmailInp(e.target.value)} />
                        <button onClick={handleCheckIn} style={{ ...styles.button, width: 'auto', background: res.accent_color, borderRadius: '50px' }}>CHECK IN</button>
                    </div>
                </div>

                {/* WEEKLY VIEW */}
                <div style={styles.wideCard}>
                    <h3>Weekly Work Schedule</h3>
                    {weekDays.map(day => {
                        const isToday = day.date === todayDate;
                        const items = assignments.filter(a => a.day_of_week === day.name || a.day_of_week === "Everyday");

                        return (
                            <div key={day.name} style={{ marginBottom: '15px' }}>
                                <div style={{ 
                                    background: isToday ? res.accent_color : '#f8f9fa', 
                                    padding: '10px 15px', 
                                    fontWeight: 'bold', 
                                    borderRadius: '8px', 
                                    color: isToday ? 'white' : '#555' 
                                }}>
                                    {day.name.toUpperCase()} — {day.date}
                                </div>
                                {items.map(a => {
                                    const present = isToday && attendance.some(att => att.employee_id === a.employee_id && att.date === todayDate);
                                    return (
                                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #eee' }}>
                                            <span><strong>{a.employee?.name}</strong> — {a.template?.name} ({a.template?.start_time.substring(0,5)} - {a.template?.end_time.substring(0,5)})</span>
                                            <span style={{ fontWeight: 'bold', color: present ? '#2e7d32' : '#f57c00' }}>
                                                {isToday ? (present ? "✅ PRESENT" : "⏳ PENDING") : "SCHEDULED"}
                                            </span>
                                        </div>
                                    );
                                })}
                                {items.length === 0 && <small style={{display:'block', padding:'10px', color:'#ccc'}}>No shifts assigned</small>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;