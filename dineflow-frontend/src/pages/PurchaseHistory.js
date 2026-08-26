import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const PurchaseHistory = () => {
    const [orders, setOrders] = useState([]);
    const customer = JSON.parse(localStorage.getItem('customer')) || {};
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };

    useEffect(() => {
        if (customer.phone) {
            axios.get(`http://localhost:8000/api/customer/history/${customer.phone}`)
                .then(r => {
                    console.log("Orders found:", r.data);
                    setOrders(r.data);
                })
                .catch(e => alert("Could not load history"));
        }
    }, [customer.phone]);

    return (
        <div style={styles.app}>
            <TopBar role="Public" />
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <div style={styles.wideCard}>
                    <h2 style={{ fontFamily: 'Verdana', color: res.accent_color }}>Your Purchase History</h2>
                    
                    {orders.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px' }}>No orders found for {customer.phone}.</p>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} style={historyCard}>
                                <div style={historyHeader}>
                                    <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
                                    <span style={{ fontWeight: 'bold' }}>Total: ৳{order.total_price}</span>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
                                            <span>{item.item_name} x {item.quantity}</span>
                                            <span>৳{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '10px', textAlign: 'right' }}>Order ID: #DF-{order.id}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const historyCard = { background: '#fff', border: '1px solid #eee', padding: '20px', borderRadius: '12px', marginBottom: '15px' };
const historyHeader = { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f4f4f4', paddingBottom: '10px', fontWeight: 'bold' };

export default PurchaseHistory;