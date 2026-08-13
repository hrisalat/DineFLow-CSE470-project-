import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';

const EmployeeAuth = ({ type }) => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [isSignup, setIsSignup] = useState(false);
    const [form, setForm] = useState({ uid: '', email: '', pass: '' });
    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const url = isSignup ? 'http://localhost:8000/api/employee/signup' : 'http://localhost:8000/api/employee/login';
            const payload = isSignup ? { unique_id: form.uid, email: form.email, password: form.pass } : { email: form.email, password: form.pass, expected_role: type };
            const result = await axios.post(url, payload);
            if (isSignup) { alert("Success! Login now."); setIsSignup(false); }
            else { 
                localStorage.setItem('restaurant', JSON.stringify(result.data.restaurant));
                navigate(type === 'Manager' ? '/manager-dashboard' : '/staff-dashboard'); 
            }
        } catch (err) { alert(err.response?.data?.message || "Auth Failed"); }
    };
    return (
        <div style={{ fontFamily: 'Verdana' }}><TopBar role={type} menuItems={[]} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h2>{type} {isSignup ? 'Sign Up' : 'Login'}</h2>
                <form onSubmit={handleAuth}>
                    {isSignup && <input style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="Unique ID" onChange={e => setForm({...form, uid: e.target.value})} required />}
                    <input style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />
                    <input style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px' }} type="password" placeholder="Password" onChange={e => setForm({...form, pass: e.target.value})} required />
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: res.accent_color, color: 'white', border: 'none', borderRadius: '6px' }}>Go</button>
                </form>
                <p onClick={() => setIsSignup(!isSignup)} style={{cursor:'pointer', textAlign:'center', marginTop:'15px'}}>{isSignup ? "Login" : "Sign Up"}</p>
            </div></div>
        </div>
    );
};

export default EmployeeAuth;