import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const ExitPublicAuth = () => {
    const navigate = useNavigate();
    // 1. Define 'res' (Restaurant Data)
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    const [pass, setPass] = useState('');

    const handleExitVerify = async (e) => {
        e.preventDefault();
        try {
            // Verify against the Admin password logic in backend
            await axios.post('http://localhost:8000/api/admin/verify', { 
                restaurant_id: res.id, 
                password: pass 
            });
            // On success, go back to the owner dashboard
            navigate('/dashboard');
        } catch (err) {
            alert("Unauthorized: Incorrect Admin Password.");
        }
    };

    return (
        <div style={styles.app}>
            {/* We show TopBar with Public role so customers don't see management buttons if they peak */}
            <TopBar role="Public" />
            
            <div style={styles.authContainer}>
                <div style={styles.card}>
                    <h2 style={{ textAlign: 'center', fontFamily: 'Verdana' }}>Admin Verification</h2>
                    <p style={{ fontSize: '12px', textAlign: 'center', color: '#666', marginBottom: '20px', fontFamily: 'Verdana' }}>
                        Please enter the <b>Admin Password</b> to exit Customer Mode and return to the Management Dashboard.
                    </p>
                    <form onSubmit={handleExitVerify}>
                        <input 
                            style={styles.input} 
                            type="password" 
                            placeholder="Enter Admin Password" 
                            onChange={e => setPass(e.target.value)} 
                            required 
                        />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color }}>
                            Verify & Exit
                        </button>
                    </form>
                    <button 
                        onClick={() => navigate('/public-view')} 
                        style={{ width: '100%', background: 'none', border: 'none', marginTop: '15px', cursor: 'pointer', fontSize: '12px', color: res.accent_color, fontFamily: 'Verdana', fontWeight: 'bold' }}
                    >
                        ← Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Add the default export so App.js can find it
export default ExitPublicAuth;