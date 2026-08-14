// src/pages/CustomerWebsite.js
import React from 'react';
import TopBar from '../components/TopBar';
import CustomerMenu from '../components/CustomerMenu';
import { styles } from '../styles/theme';

const CustomerWebsite = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};

    // Check if website is active
    if (res.is_website_active === false || res.is_website_active === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'Verdana' }}>
                <h1>Website Offline</h1>
                <p>We are not accepting online orders at the moment.</p>
            </div>
        );
    }

    return (
        <div style={styles.app}>
            {/* Pass "Public" role so TopBar shows customer buttons */}
            <TopBar role="Public" />
            
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <h1 style={{ color: res.accent_color, textAlign: 'center', marginBottom: '40px' }}>
                    Welcome to {res.restaurant_name}
                </h1>
                <CustomerMenu />
            </div>
        </div>
    );
};

export default CustomerWebsite;