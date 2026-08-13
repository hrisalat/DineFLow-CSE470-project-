import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const Dashboard = () => {
    const navigate = useNavigate(); // Initialize navigate
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};

    return (
        <div style={styles.app}>
            <TopBar role="Owner" />
            <div style={styles.container}>
                <div style={{ display: 'flex', gap: '30px', marginTop: '50px' }}>
                    
                    {/* FIXED: Connected Public View Button */}
                    <div 
                        style={{ ...styles.card, textAlign: 'center', cursor: 'pointer', background: res.accent_color, color: 'white', width: '250px' }} 
                        onClick={() => navigate('/public-view')}
                    >
                        <h2 style={{ margin: 0 }}>Public View</h2>
                    </div>

                    <div 
                        style={{ ...styles.card, textAlign: 'center', cursor: 'pointer', background: res.accent_color, color: 'white', width: '250px' }} 
                        onClick={() => navigate('/employee-view')}
                    >
                        <h2 style={{ margin: 0 }}>Employee View</h2>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;