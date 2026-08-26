import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const Dashboard = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };

    // Clean styles for this specific page
    const dashboardStyles = {
        mainContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 70px)', // Full screen minus TopBar height
            gap: '40px',
            padding: '20px',
            flexWrap: 'wrap'
        },
        card: {
            width: '300px',
            height: '200px',
            backgroundColor: res.accent_color,
            color: 'white',
            borderRadius: '15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s, filter 0.3s',
            textAlign: 'center',
            padding: '20px'
        },
        cardTitle: {
            fontSize: '24px',
            fontWeight: 'bold',
            fontFamily: 'Verdana',
            margin: 0
        }

        
    };
    

    return (
        <div style={styles.app}>
            <TopBar role="Owner" />
            
            <div style={dashboardStyles.mainContainer}>
                
                {/* KIOSK / PUBLIC VIEW CARD */}
                <div 
                    style={dashboardStyles.card}
                    onClick={() => navigate('/kiosk')}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.filter = 'brightness(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.filter = 'brightness(1)';
                    }}
                >
                    <h2 style={dashboardStyles.cardTitle}>Kiosk Mode</h2>
                </div>

                {/* EMPLOYEE VIEW CARD */}
                <div 
                    style={dashboardStyles.card}
                    onClick={() => navigate('/employee-view')}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.filter = 'brightness(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.filter = 'brightness(1)';
                    }}
                >
                    <h2 style={dashboardStyles.cardTitle}>Employee View</h2>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;