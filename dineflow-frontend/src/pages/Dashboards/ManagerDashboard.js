import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const ManagerDashboard = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    
    // Data States
    const [templates, setTemplates] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [attendance, setAttendance] = useState([]);

    // Modal/Form States
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [shiftForm, setShiftForm] = useState({ name: '', start: '', end: '' });
    const [assignForm, setAssignForm] = useState({ employee_id: '', template_id: '', day: '' });

    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayDate = new Date().toISOString().split('T')[0];

    // --- NEW: Helper to get dates for the current week ---
    const getWeekDates = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); 
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - dayOfWeek); 

        return [0, 1, 2, 3, 4, 5, 6].map(offset => {
            const date = new Date(sunday);
            date.setDate(sunday.getDate() + offset);
            return {
                name: date.toLocaleDateString('en-US', { weekday: 'long' }), 
                dateString: date.toISOString().split('T')[0] 
            };
        });
    };

    const weekDays = getWeekDates();

    const fetchData = useCallback(async () => {
        if (!res.id) return;
        try {
            const [t, e, s, att] = await Promise.all([
                axios.get(`http://localhost:8000/api/shift-templates/${res.id}`),
                axios.get(`http://localhost:8000/api/employees/${res.id}`),
                axios.get(`http://localhost:8000/api/schedules/${res.id}`),
                axios.get(`http://localhost:8000/api/attendance/${res.id}`)
            ]);
            setTemplates(t.data);
            setEmployees(e.data);
            setAssignments(s.data);
            setAttendance(att.data);
        } catch (err) { console.error("Fetch failed", err); }
    }, [res.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:8000/api/shift-templates', { ...shiftForm, restaurant_id: res.id });
        setShowShiftModal(false);
        setShiftForm({ name: '', start: '', end: '' });
        fetchData();
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:8000/api/schedules', { ...assignForm, restaurant_id: res.id });
        setShowAssignModal(false);
        fetchData();
    };

    return (
        <div style={styles.app}>
            <TopBar role="Manager" />
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                <h1 style={{ color: res.accent_color }}>Manager Console</h1>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <button onClick={() => setShowShiftModal(true)} style={actionBtn(res.accent_color)}>+ DEFINE SHIFTS</button>
                    <button onClick={() => setShowAssignModal(true)} style={actionBtn("#333")}>+ ASSIGN STAFF</button>
                </div>

                <div style={{...styles.wideCard, marginBottom:'30px'}}>
                    <h4 style={{fontSize:'12px', color:'#888'}}>DEFINED SHIFT TYPES</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {templates.map(t => (
                            <div key={t.id} style={chipStyle}>
                                <span><b>{t.name}</b> ({t.start_time.substring(0,5)} - {t.end_time.substring(0,5)})</span>
                                <button onClick={() => axios.delete(`http://localhost:8000/api/shift-templates/${t.id}`).then(fetchData)} style={chipDelBtn}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.wideCard}>
                    <h3>Full Team Schedule</h3>
                    {weekDays.map(day => {
                        const items = assignments.filter(a => a.day_of_week === day.name || a.day_of_week === "Everyday");
                        const isActuallyToday = day.dateString === todayDate;
                        return (
                            <div key={day.name} style={{ marginBottom: '15px' }}>
                                <div style={{ 
                                    background: isActuallyToday ? res.accent_color : '#f8f9fa', 
                                    padding: '10px', 
                                    borderRadius: '8px', 
                                    color: isActuallyToday ? 'white' : '#555', 
                                    fontWeight:'bold',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>{day.name.toUpperCase()} — {day.dateString}</span>
                                    {isActuallyToday && <span style={{fontSize: '10px'}}>TODAY</span>}
                                </div>
                                {items.map(a => {
                                    const present = isActuallyToday && attendance.some(att => att.employee_id === a.employee_id && att.date === todayDate);
                                    return (
                                        <div key={a.id} style={rowStyle}>
                                            <span><strong>{a.employee?.name}</strong> ({a.template?.name})</span>
                                            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                                <span style={{fontSize:'11px', fontWeight:'bold', color: present ? '#2e7d32' : '#f57c00'}}>{isActuallyToday ? (present ? "✅ PRESENT" : "⏳ PENDING") : "SCHEDULED"}</span>
                                                <button onClick={() => axios.delete(`http://localhost:8000/api/schedules/${a.id}`).then(fetchData)} style={{border:'none', background:'none', cursor:'pointer'}}>❌</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODALS */}
            {showShiftModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleSaveTemplate}>
                        <h3>Define Shift</h3>
                        <input placeholder="Shift Name" style={styles.input} onChange={e => setShiftForm({...shiftForm, name: e.target.value})} required />
                        <input type="time" style={styles.input} onChange={e => setShiftForm({...shiftForm, start: e.target.value})} required />
                        <input type="time" style={styles.input} onChange={e => setShiftForm({...shiftForm, end: e.target.value})} required />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, borderRadius: '50px' }}>SAVE</button>
                        <button type="button" onClick={() => setShowShiftModal(false)} style={{ ...styles.button, background: '#444', borderRadius: '50px' }}>CANCEL</button>
                    </form>
                </div>
            )}

            {showAssignModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleAssign}>
                        <h3>Assign Staff</h3>
                        <select style={styles.input} onChange={e => setAssignForm({ ...assignForm, employee_id: e.target.value })} required>
                            <option value="">Select Employee...</option>
                            {employees.filter(e => e.position.toLowerCase() !== 'manager').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <select style={styles.input} onChange={e => setAssignForm({ ...assignForm, template_id: e.target.value })} required>
                            <option value="">Select Shift...</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <select style={styles.input} onChange={e => setAssignForm({ ...assignForm, day: e.target.value })} required>
                            <option value="">Select Day...</option>
                            <option value="Everyday">Everyday</option>
                            {/* Use name property from weekDays */}
                            {weekDays.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, borderRadius: '50px' }}>ASSIGN</button>
                        <button type="button" onClick={() => setShowAssignModal(false)} style={{ ...styles.button, background: '#444', borderRadius: '50px' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const actionBtn = (color) => ({ background: color, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', fontFamily: 'Verdana' });
const chipStyle = { background: 'white', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' };
const chipDelBtn = { background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px' };
const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee', fontSize: '14px' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };

export default ManagerDashboard;