import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const CustomerOrderProgress = () => {
    const customer = JSON.parse(localStorage.getItem('customer')) || {};
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [orders, setOrders] = useState([]);

    const fetchMyOrders = useCallback(async () => {
        if (!customer.phone) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/customer/active-orders/${customer.phone}`);
            // Ensure we are working with an array
            const data = Array.isArray(response.data) ? response.data : [];
            setOrders(data);
        } catch (err) { 
            console.error("Customer fetch failed", err); 
        }
    }, [customer.phone]);

    useEffect(() => {
        fetchMyOrders();
        const interval = setInterval(fetchMyOrders, 10000); 
        return () => clearInterval(interval);
    }, [fetchMyOrders]);

    // 1. Logic: Filter out "Delivered" orders so they disappear from this view
    const activeOrders = orders.filter(order => order.status !== 'Delivered');

    return (
        <div style={styles.app}>
            <TopBar role="Public" />
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <div style={styles.wideCard}>
                    <h2 style={{ fontFamily: 'Verdana', color: res.accent_color }}>Track Your Order</h2>
                    
                    {/* 2. Logic: Check the filtered 'activeOrders' length */}
                    {activeOrders.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            You have no active orders.
                        </p>
                    ) : (
                        activeOrders.map(order => (
                            <div key={order.id} style={orderBox}>
                                <div style={{ flex: 1 }}>
                                    <strong>Order #DF-{order.id}</strong><br/>
                                    <small style={{ color: '#666' }}>
                                        Items: {order.items?.map(i => i.item_name).join(', ')}
                                    </small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ 
                                        padding: '8px 20px', 
                                        borderRadius: '50px', 
                                        color: 'white', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        // 3. Logic: Specific color for 'Ready to serve'
                                        backgroundColor: order.status === 'Ready to serve' 
                                            ? '#2e7d32' // Success Green
                                            : (order.status === 'Preparing' ? res.accent_color : '#888')
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const orderBox = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f4f4f4' };

export default CustomerOrderProgress;