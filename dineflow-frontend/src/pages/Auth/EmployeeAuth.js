import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const EmployeeAuth = ({ type }) => {
    const navigate = useNavigate();
    // Default to DineFlow blue if no restaurant is loaded yet
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    
    const [isSignup, setIsSignup] = useState(false);
    const [form, setForm] = useState({ uid: '', email: '', pass: '' });

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const url = isSignup ? 'http://localhost:8000/api/employee/signup' : 'http://localhost:8000/api/employee/login';
            
            // Payload logic: 
            // Signup needs the Unique ID. 
            // Login needs expected_role to prevent Managers logging into Staff pages.
            const payload = isSignup 
                ? { unique_id: form.uid, email: form.email, password: form.pass } 
                : { email: form.email, password: form.pass, expected_role: type };

            const result = await axios.post(url, payload);
            
            if (isSignup) {
                alert("Account Created Successfully! Please switch to Login.");
                setIsSignup(false);
            } else { 
                // LOGIN SUCCESS: 
                // We merge the restaurant branding with the employee's role/id
                const sessionData = {
                    ...result.data.restaurant,
                    position: result.data.employee.position, 
                    employee_id: result.data.employee.id,
                    id: result.data.restaurant.id // Ensure restaurant ID is preserved
                };
                
                localStorage.setItem('restaurant', JSON.stringify(sessionData));
                
                // Redirect to the correct workspace
                if (type === 'Manager') navigate('/manager-dashboard');
                else navigate('/staff-dashboard'); 
            }
        } catch (err) { 
            // Show specific error from Laravel (e.g., "Access Denied" or "Invalid ID")
            alert(err.response?.data?.message || "Authentication Failed. Please check your credentials."); 
        }
    };

    return (
        <div style={styles.app}>
            {/* TopBar role is passed to show correct branding, buttons hidden automatically via TopBar.js logic */}
            <TopBar role={type} />
            
            <div style={styles.authContainer}>
                <div style={styles.card}>
                    <h2 style={{ textAlign: 'center', fontFamily: 'Verdana', color: '#333' }}>
                        {type} {isSignup ? 'Sign Up' : 'Login'}
                    </h2>
                    
                    <form onSubmit={handleAuth}>
                        {isSignup && (
                            <>
                                <label style={lbl}>Unique ID (from Admin)</label>
                                <input 
                                    style={styles.input} 
                                    placeholder="Enter 10-digit ID" 
                                    onChange={e => setForm({ ...form, uid: e.target.value })} 
                                    required 
                                />
                            </>
                        )}

                        <label style={lbl}>Email Address</label>
                        <input 
                            style={styles.input} 
                            type="email" 
                            placeholder="Enter your email" 
                            onChange={e => setForm({ ...form, email: e.target.value })} 
                            required 
                        />

                        <label style={lbl}>Password</label>
                        <input 
                            style={styles.input} 
                            type="password" 
                            placeholder="••••••" 
                            onChange={e => setForm({ ...form, pass: e.target.value })} 
                            required 
                        />

                        <button 
                            type="submit" 
                            style={{ 
                                ...styles.button, 
                                backgroundColor: res.accent_color, 
                                borderRadius: '50px', // Capsule Shape
                                marginTop: '20px' 
                            }}
                        >
                            {isSignup ? 'CREATE ACCOUNT' : 'SIGN IN'}
                        </button>
                    </form>

                    <p 
                        onClick={() => setIsSignup(!isSignup)} 
                        style={{ cursor: 'pointer', textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666' }}
                    >
                        {isSignup ? "Already registered? Login here" : "Need an account? Sign Up with your ID"}
                    </p>
                </div>
            </div>
        </div>
    );
};

const lbl = { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginTop: '10px', display: 'block' };

export default EmployeeAuth;