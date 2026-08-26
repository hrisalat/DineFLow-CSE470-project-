import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../../styles/theme';
import TopBar from '../../components/TopBar';

const CustomerAuth = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [isSignup, setIsSignup] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', password: '' });

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const url = isSignup ? 'http://localhost:8000/api/customer/register' : 'http://localhost:8000/api/customer/login';
            const payload = { ...form, restaurant_id: res.id };
            const result = await axios.post(url, payload);
            
            if (result.data.status === 'success') {
                // FIXED: Now saving the ID along with name and phone
                localStorage.setItem('customer', JSON.stringify({
                    id: result.data.user.id,    // <--- THIS IS THE CRITICAL LINE
                    name: result.data.user.name,
                    phone: result.data.user.phone,
                    role: 'customer'
                }));
                
                alert(isSignup ? "Account Created!" : "Login Successful!");
                navigate('/customer-website');
            }
        } catch (err) { 
            alert("Auth failed. Please check your phone number and password."); 
        }
    };

    return (
        <div style={styles.app}>
            <TopBar role="Public" />
            <div style={styles.authContainer}>
                <div style={styles.card}>
                    <h2 style={{ textAlign: 'center', color: res.accent_color, fontFamily: 'Verdana' }}>
                        Customer {isSignup ? 'Sign Up' : 'Login'}
                    </h2>
                    <form onSubmit={handleAuth}>
                        {isSignup && (
                            <input 
                                style={styles.input} 
                                placeholder="Full Name" 
                                onChange={e => setForm({ ...form, name: e.target.value })} 
                                required 
                            />
                        )}
                        <input 
                            style={styles.input} 
                            placeholder="Phone Number" 
                            onChange={e => setForm({ ...form, phone: e.target.value })} 
                            required 
                        />
                        <input 
                            style={styles.input} 
                            type="password" 
                            placeholder="Password" 
                            onChange={e => setForm({ ...form, password: e.target.value })} 
                            required 
                        />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, borderRadius: '50px' }}>
                            {isSignup ? 'CREATE ACCOUNT' : 'SIGN IN'}
                        </button>
                    </form>
                    <p 
                        onClick={() => setIsSignup(!isSignup)} 
                        style={{ cursor: 'pointer', textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666' }}
                    >
                        {isSignup ? "Already have an account? Login" : "New here? Create Account"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerAuth;