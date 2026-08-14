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

    // src/pages/Auth/CustomerAuth.js

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const url = isSignup ? 'http://localhost:8000/api/customer/register' : 'http://localhost:8000/api/customer/login';
            const payload = { ...form, restaurant_id: res.id };
            const result = await axios.post(url, payload);
            
            if (result.data.status === 'success') {
                // FIX: Use setItem without clearing existing 'restaurant' data
                localStorage.setItem('customer', JSON.stringify(result.data.user));
                
                alert(isSignup ? "Account Created!" : "Logged In!");
                navigate('/customer-website'); // Navigate to the website
            }
        } catch (err) { 
            alert("Auth Failed: Check your phone number or password."); 
        }
    };

    return (
        <div style={styles.app}>
            <TopBar role="Public" />
            <div style={styles.authContainer}>
                <div style={styles.card}>
                    <h2 style={{ textAlign: 'center', color: res.accent_color }}>
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
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color }}>
                            {isSignup ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>
                    <p 
                        onClick={() => setIsSignup(!isSignup)} 
                        style={{ cursor: 'pointer', textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#666' }}
                    >
                        {isSignup ? "Already have an account? Login" : "New here? Create Account"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerAuth;