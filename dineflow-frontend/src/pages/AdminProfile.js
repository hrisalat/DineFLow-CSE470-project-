import React, { useState } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const AdminProfile = () => {
    // 1. DATA AND STATE INITIALIZATION
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    
    const [formData, setFormData] = useState({
        name: res.restaurant_name || '',
        email1: res.email_primary || '',
        email2: res.email_secondary || '',
        phone: res.phone || '',
        regNo: res.registration_no || '',
        color: res.accent_color || '#6366f1'
    });
    
    const [logo, setLogo] = useState(null);
    const [webActive, setWebActive] = useState(res.is_website_active);

    // 2. HELPER: COLOR VALIDATION
    const isColorTooLight = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r >= 210 && g >= 210 && b >= 210);
    };

    // 3. TOGGLE WEBSITE STATUS
    const toggleWeb = async () => {
        const newStatus = !webActive;
        try {
            await axios.post(`http://localhost:8000/api/restaurant/toggle-website/${res.id}`, { status: newStatus });
            setWebActive(newStatus);
            // Update local storage so other pages know the status
            const updatedRes = { ...res, is_website_active: newStatus };
            localStorage.setItem('restaurant', JSON.stringify(updatedRes));
            alert(`Customer Website is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
        } catch (err) {
            alert("Failed to update website status.");
        }
    };

    // 4. UPDATE RESTAURANT DETAILS
    const handleUpdate = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(k => data.append(k, formData[k]));
        if (logo) data.append('logo', logo);

        try {
            const result = await axios.post(`http://localhost:8000/api/restaurant/update/${res.id}`, data);
            if (result.data.status === 'success') {
                alert("Restaurant Details Updated Successfully!");
                // Keep the is_website_active status while updating brand info
                const updatedSession = { ...result.data.restaurant, is_website_active: webActive };
                localStorage.setItem('restaurant', JSON.stringify(updatedSession));
                window.location.reload(); 
            }
        } catch (err) {
            alert("Update Failed. Ensure emails are unique.");
        }
    };

    return (
        <div style={styles.app}>
            <TopBar role="Admin" />
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={{ textAlign: 'center', fontFamily: 'Verdana' }}>Edit Restaurant Profile</h2>
                    
                    {/* WEBSITE TOGGLE SECTION */}
                    <div style={toggleBox}>
                        <div>
                            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>CUSTOMER WEBSITE</span>
                            <p style={{ margin: 0, fontSize: '10px', color: '#888' }}>Enable or disable external access to your menu</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={toggleWeb} 
                            style={{ 
                                padding: '10px 20px', 
                                borderRadius: '50px', 
                                background: webActive ? '#4caf50' : '#ff4d4d', 
                                color: 'white', 
                                border: 'none', 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '11px'
                            }}
                        >
                            {webActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                    </div>

                    <form onSubmit={handleUpdate}>
                        <label style={lbl}>Restaurant Name</label>
                        <input style={styles.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        
                        <label style={lbl}>Primary Email</label>
                        <input style={styles.input} type="email" value={formData.email1} onChange={e => setFormData({ ...formData, email1: e.target.value })} required />
                        
                        <label style={lbl}>Secondary Email</label>
                        <input style={styles.input} type="email" value={formData.email2} onChange={e => setFormData({ ...formData, email2: e.target.value })} />
                        
                        <label style={lbl}>Phone Number</label>
                        <input style={styles.input} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                        
                        <label style={lbl}>Registration Number</label>
                        <input style={styles.input} value={formData.regNo} onChange={e => setFormData({ ...formData, regNo: e.target.value })} required />
                        
                        <label style={lbl}>Theme Accent Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <input 
                                type="color" 
                                value={formData.color} 
                                onChange={e => {
                                    const selectedColor = e.target.value;
                                    if (isColorTooLight(selectedColor)) {
                                        alert("This color is too light for the DineFlow theme. Please choose a darker shade.");
                                    } else {
                                        setFormData({ ...formData, color: selectedColor });
                                    }
                                }} 
                                style={{ width: '60px', height: '40px', border: '1px solid #ddd', cursor: 'pointer', padding: '0' }} 
                            />
                            <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>{formData.color.toUpperCase()}</span>
                        </div>
                        
                        <label style={lbl}>Update Logo</label>
                        <input type="file" onChange={e => setLogo(e.target.files[0])} style={{ marginBottom: '15px', marginTop: '5px' }} />
                        
                        <button type="submit" style={{ ...styles.button, backgroundColor: formData.color, borderRadius: '50px' }}>
                            SAVE CHANGES
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- EXTRA STYLES ---
const lbl = { fontSize: '11px', fontWeight: 'bold', marginTop: '15px', display: 'block', color: '#666', textTransform: 'uppercase', fontFamily: 'Verdana' };
const toggleBox = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '15px', 
    background: '#f1f1f1', 
    borderRadius: '10px', 
    marginBottom: '20px',
    border: '1px solid #eee'
};

export default AdminProfile;