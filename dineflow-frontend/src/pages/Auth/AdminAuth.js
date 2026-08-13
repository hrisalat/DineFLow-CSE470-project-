import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const AdminAuth = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [pass, setPass] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/admin/verify', { 
                restaurant_id: res.id, 
                password: pass 
            });
            navigate('/admin-panel');
        } catch (err) {
            alert("Incorrect Admin Password");
        }
    };

    return (
        <div style={styles.app}>
            <TopBar role="Admin Login" menuItems={[]} />
            <div style={styles.authContainer}>
                <div style={styles.card}>
                    <h2 style={{ textAlign: 'center' }}>Admin Verification</h2>
                    <p style={{ fontSize: '12px', textAlign: 'center', color: '#666' }}></p>
                    <form onSubmit={handleVerify}>
                        <input style={styles.input} type="password" placeholder="Admin Password" onChange={e => setPass(e.target.value)} required />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color }}>Verify</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;