import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const RoleSelection = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };

    // Standard button style to keep code clean
    const capsuleButtonStyle = {
        padding: '20px 40px',
        borderRadius: '50px',
        width: '325px',
        height: '80px',
        background: res.accent_color,
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '28px',
        fontWeight: 'bold',
        fontFamily: 'Verdana',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        transition: '0.3s',
        marginBottom: '30px' // Spacing between buttons
    };

    return (
        <div style={styles.app}>
            {/* TopBar knows to hide middle buttons because role is not Admin/Manager/Staff */}
            <TopBar role="Access" />

            <div style={styles.container}>
                <h1 style={{ 
                    marginBottom: '50px', 
                    fontSize: '40px', 
                    fontWeight: 'bold', 
                    fontFamily: 'Verdana',
                    color: '#333' 
                }}>
                    Who are you?
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {/* ADMIN BUTTON */}
                    <button 
                        onClick={() => navigate('/admin-auth')} 
                        style={capsuleButtonStyle}
                        onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
                        onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
                    >
                        Admin
                    </button>

                    {/* MANAGER BUTTON - Standardized route to lowercase */}
                    <button 
                        onClick={() => navigate('/manager-auth')} 
                        style={capsuleButtonStyle}
                        onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
                        onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
                    >
                        Manager
                    </button>

                    {/* STAFF BUTTON - Standardized route to lowercase */}
                    <button 
                        onClick={() => navigate('/staff-auth')} 
                        style={capsuleButtonStyle}
                        onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
                        onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
                    >
                        Staff
                    </button>

                </div>
            </div>
        </div>
    );
};

export default RoleSelection;