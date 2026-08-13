import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const RoleSelection = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};

    return (
        <div style={styles.app}>
            <TopBar role="Access" menuItems={[]} />
            <div style={styles.container}>
                <p style={{ marginBottom: '50px', fontSize: '40px', fontWeight:'bold'}}> Who are you?</p>
                <div style={{ display: 'flex', marginBottom: '40px' }}>
                    <button onClick={() => navigate('/admin-auth')} style={{ padding: '20px 40px', borderRadius: '50px', width:'325px', height:'80px', background: res.accent_color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '30px',  boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                        Admin
                    </button>
                </div>
                 <div style={{ display: 'flex', marginBottom: '40px' }}>
                    <button onClick={() => navigate('/Manager-auth')} style={{ padding: '20px 40px', borderRadius: '50px', width:'325px', height:'80px', background: res.accent_color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '30px',  boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                        Manager
                    </button>
                </div>
                 <div style={{ display: 'flex', marginBottom: '40px' }}>
                    <button onClick={() => navigate('/Staff-auth')} style={{ padding: '20px 40px', borderRadius: '50px', width:'325px', height:'80px', background: res.accent_color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '30px',  boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                        Staff
                    </button>
                </div>
                
                
                
               
                   
                </div>
            </div>
        
    );
};

export default RoleSelection;