import React from 'react';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const PublicView = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};

    return (
        <div style={styles.app}>
            <TopBar role="Public" />
            <div style={{ ...styles.container, textAlign: 'center' }}>
                <h1 style={{ color: res.accent_color, fontSize: '32px' }}>
                    Welcome to {res.restaurant_name || 'Our Restaurant'}
                </h1>
                <p style={{ fontSize: '18px', color: '#666' }}>Browse our delicious menu below</p>

                
            
            </div>
        </div>
    );
};

export default PublicView;