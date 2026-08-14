import React from 'react';
import TopBar from '../components/TopBar';
import CustomerMenu from '../components/CustomerMenu';
import { styles } from '../styles/theme';

const KioskMode = () => {
    return (
        <div style={styles.app}>
            <TopBar role="Kiosk" />
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <h1 style={{ fontSize: '50px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px' }}>MENU</h1>
                <CustomerMenu />
            </div>
        </div>
    );
};

export default KioskMode;