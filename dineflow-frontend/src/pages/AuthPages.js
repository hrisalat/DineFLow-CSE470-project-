import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';

export const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/login', { email, password });
            localStorage.setItem('restaurant', JSON.stringify(res.data.restaurant));
            navigate('/dashboard');
        } catch (err) { alert("Login Failed"); }
    };
    return (
        <div style={{ fontFamily: 'Verdana', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center' }}>DineFlow Login</h2>
                <form onSubmit={handleLogin}>
                    <input style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px' }} type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required />
                    <input style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px' }} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
                </form>
                <p style={{ textAlign: 'center', fontSize: '14px' }}>New? <Link to="/register">Register Restaurant</Link></p>
            </div>
        </div>
    );
};

export const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email1: '', password: '', phone: '', regNo: '', color: '#6366f1' });
    const [logo, setLogo] = useState(null);
    const handleRegister = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(k => data.append(k, formData[k]));
        if (logo) data.append('logo', logo);
        try {
            await axios.post('http://localhost:8000/api/register', data);
            alert("Success!"); navigate('/');
        } catch (err) { alert("Registration Failed"); }
    };
    return (
        <div style={{ fontFamily: 'Verdana', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' }}>
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <input style={{ width: '100%', padding: '10px', margin: '5px 0' }} placeholder="Name" onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <input style={{ width: '100%', padding: '10px', margin: '5px 0' }} type="email" placeholder="Email" onChange={e => setFormData({ ...formData, email1: e.target.value })} required />
                    <input style={{ width: '100%', padding: '10px', margin: '5px 0' }} type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                    <input style={{ width: '100%', padding: '10px', margin: '5px 0' }} placeholder="Phone" onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    <input style={{ width: '100%', padding: '10px', margin: '5px 0' }} placeholder="Reg No" onChange={e => setFormData({ ...formData, regNo: e.target.value })} required />
                    <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ width: '100%', height: '40px', border:'none' }} />
                    <input type="file" onChange={e => setLogo(e.target.files[0])} />
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: formData.color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>Sign Up</button>
                </form>
            </div>
        </div>
    );
};

export const RoleSelection = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    return (
        <div style={{ fontFamily: 'Verdana' }}>
            <TopBar role="Access" menuItems={[]} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '150px' }}>
                <h1>Who are you?</h1>
                <div style={{ display: 'flex', gap: '20px' }}>
                    {['Admin', 'Manager', 'Staff'].map(role => (
                        <button key={role} onClick={() => navigate(`/${role.toLowerCase()}-auth`)}
                            style={{ padding: '40px 60px', borderRadius: '15px', background: res.accent_color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>
                            {role}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AdminAuth = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [pass, setPass] = useState('');
    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/admin/verify', { restaurant_id: res.id, password: pass });
            navigate('/admin-panel');
        } catch (err) { alert("Incorrect Password"); }
    };
    return (
        <div style={{ fontFamily: 'Verdana' }}>
            <TopBar role="Admin Login" menuItems={[]} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                    <h2>Admin Verification</h2>
                    <form onSubmit={handleVerify}>
                        <input style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px' }} type="password" placeholder="Admin Password" onChange={e => setPass(e.target.value)} required />
                        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: res.accent_color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Verify</button>
                    </form>
                </div>
            </div>
        </div>
    );
};