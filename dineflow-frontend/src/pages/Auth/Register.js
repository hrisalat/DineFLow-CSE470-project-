import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../../styles/theme';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ 
        name: '', 
        email1: '', 
        password: '', 
        phone: '', 
        regNo: '', 
        color: '#427A43' 
    });
    const [logo, setLogo] = useState(null);

    // Helper function to check if color is too light (Range 210-255)
    const isColorTooLight = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        // Returns true if all channels are above 210 (too white/light grey)
        return (r >= 210 && g >= 210 && b >= 210);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(k => data.append(k, formData[k]));
        if (logo) data.append('logo', logo);
        try {
            await axios.post('http://localhost:8000/api/register', data);
            alert("Success! Restaurant Registered.");
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Registration Failed: Ensure emails are unique.";
            alert(errorMsg);
        }
    };

    return (
        <div style={styles.authContainer}>
            <div style={styles.card}>
                <h2 style={{ textAlign: 'center' }}>Register Restaurant</h2>
                <form onSubmit={handleRegister}>
                    <input style={styles.input} placeholder="Restaurant Name" onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <input style={styles.input} type="email" placeholder="Primary Email" onChange={e => setFormData({ ...formData, email1: e.target.value })} required />
                    <input style={styles.input} type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                    <input style={styles.input} placeholder="Phone" onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    <input style={styles.input} placeholder="Address of the resturant" onChange={e => setFormData({ ...formData, regNo: e.target.value })} required />
                    
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginTop: '10px' }}>Choose your Brand Color:</label>
                    <input 
                        type="color" 
                        value={formData.color} 
                        onChange={e => {
                            const selectedColor = e.target.value;
                            if (isColorTooLight(selectedColor)) {
                                alert("This color is too light for DineFlow. Please select a darker shade so white text remains visible.");
                            } else {
                                setFormData({ ...formData, color: selectedColor });
                            }
                        }} 
                        style={{ width: '30%', height: '40px', border: '1px solid #ddd', cursor: 'pointer', marginTop: '5px' }} 
                    />
                    
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginTop: '10px' }}>Logo:</label>
                    <input type="file" onChange={e => setLogo(e.target.files[0])} style={{ marginBottom: '15px', marginTop: '5px' }} />
                    
                    {/* Updated Sign Up button to be capsule shaped */}
                    <button type="submit" style={{ ...styles.button, backgroundColor: formData.color, borderRadius: '50px', marginTop: '10px' }}>
                        SIGN UP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;