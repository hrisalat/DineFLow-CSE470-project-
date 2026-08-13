import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../../styles/theme';
import welcomeImg from '../../images/welcome_img.jpg'; // Importing your image

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/login', { email, password });
            localStorage.setItem('restaurant', JSON.stringify(res.data.restaurant));
            navigate('/dashboard');
        } catch (err) { 
            alert("Login Failed: Check credentials"); 
        }
    };

    // Internal styles for the split layout
    const loginStyles = {
        pageWrapper: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            fontFamily: 'Verdana, Geneva, sans-serif'
        },
        guestTopBar: {
            height: '70px',
            backgroundColor: '#427A43', // Classic DineFlow color
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 40px',
            color: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 10
        },
        signupBtn: {
            padding: '10px 20px',
            border: '2px solid white',
            borderRadius: '20px',
            backgroundColor: 'transparent',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'none',
            fontSize: '13px'
        },
        mainContent: {
            display: 'flex',
            flex: 1, // Takes up remaining height
        },
        imageContainer: {
            flex: 0.75, // 60% Width
            backgroundColor: '#eee',
        },
        welcomeImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover' // Makes sure image covers the area without stretching
        },
        formContainer: {
            flex: 0.4, // 40% Width
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#e8f7e8',
            padding: '0px'
        }
    };

    return (
        <div style={loginStyles.pageWrapper}>
            {/* 1. GUEST TOPBAR */}
            <div style={loginStyles.guestTopBar}>
                <h1 style={{ margin: 0, letterSpacing: '1px' }}>DineFlow</h1>
                <Link to="/register" style={loginStyles.signupBtn}>SIGN UP</Link>
            </div>

            {/* 2. SPLIT LAYOUT */}
            <div style={loginStyles.mainContent}>
                {/* Left Side: Image (60%) */}
                <div style={loginStyles.imageContainer}>
                    <img src={welcomeImg} alt="Welcome to DineFlow" style={loginStyles.welcomeImage} />
                </div>

                {/* Right Side: Login Box (40%) */}
                <div style={loginStyles.formContainer}>
                    <div style={{ ...styles.card, width: '100%', maxWidth: '380px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h2>
                        <form onSubmit={handleLogin}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>EMAIL</label>
                            <input 
                                style={styles.input} 
                                type="email" 
                                placeholder="Enter your email" 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                            />
                            
                            <label style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '10px', display: 'block' }}>PASSWORD</label>
                            <input 
                                style={styles.input} 
                                type="password" 
                                placeholder="Enter your password" 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                            />
                            
                            <button type="submit" style={{ ...styles.button, backgroundColor: '#427A43', marginTop: '20px', borderRadius: '20px' }}>
                                LOGIN
                            </button>
                        </form>
                        <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '20px', color: '#666' }}>
                            New to DineFlow? <Link to="/register" style={{ color: '#427A43', fontWeight: 'bold' }}>Register here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;