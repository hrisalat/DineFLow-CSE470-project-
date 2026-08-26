import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const EmployeeAuth = ({ type }) => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    
    const [isSignup, setIsSignup] = useState(false);
    const [form, setForm] = useState({ uid: '', email: '', pass: '' });

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const url = isSignup ? 'http://localhost:8000/api/employee/signup' : 'http://localhost:8000/api/employee/login';
            const payload = isSignup 
                ? { unique_id: form.uid, email: form.email, password: form.pass } 
                : { email: form.email, password: form.pass, expected_role: type };

            const result = await axios.post(url, payload);
            
            if (isSignup) {
                alert("Account Created Successfully! Please switch to Login.");
                setIsSignup(false);
            } else { 
                // CRITICAL FIX: Ensure the ID is saved specifically as 'id'
                // Some backends return 'id', others 'restaurant_id'
                const restaurantInfo = result.data.restaurant;
                const employeeInfo = result.data.employee;

                const sessionData = {
                    ...restaurantInfo,
                    id: restaurantInfo.id, // Mandatory for all API calls
                    position: employeeInfo.position, 
                    employee_id: employeeInfo.id,
                    employee_name: employeeInfo.name,
                    employee_email: employeeInfo.email
                };
                
                localStorage.setItem('restaurant', JSON.stringify(sessionData));
                
                alert("Login Successful!");
                if (type === 'Manager') navigate('/manager-dashboard');
                else navigate('/staff-dashboard'); 
            }
        } catch (err) { 
            const errorMsg = err.response?.data?.message || "Authentication Failed. check your credentials.";
            alert(errorMsg); 
        }
    };

    return (
        <div style={styles.app}>
            <TopBar role={type} />
            <div style={styles.authContainer}>
                <div style={styles.card}>
                    <h2 style={{ textAlign: 'center', fontFamily: 'Verdana' }}>{type} {isSignup ? 'Sign Up' : 'Login'}</h2>
                    <form onSubmit={handleAuth}>
                        {isSignup && <input style={styles.input} placeholder="10-Digit Unique ID" onChange={e => setForm({ ...form, uid: e.target.value })} required />}
                        <input style={styles.input} type="email" placeholder="Email Address" onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <input style={styles.input} type="password" placeholder="Password" onChange={e => setForm({ ...form, pass: e.target.value })} required />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, borderRadius: '50px', marginTop: '15px' }}>GO</button>
                    </form>
                    <p onClick={() => setIsSignup(!isSignup)} style={{ cursor: 'pointer', textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#666' }}>
                        {isSignup ? "Already have an account? Login" : "First time? Sign Up"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeAuth;