import React, { useState } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const OrderLookup = () => {
    const [orderId, setOrderId] = useState('');
    const [orderData, setOrderData] = useState(null);
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://localhost:8000/api/order-lookup/${orderId}`);
            setOrderData(response.data);
        } catch (err) {
            alert("Order ID not found.");
            setOrderData(null);
        }
    };

    return (
        <div style={styles.app}>
            <TopBar role="Public" />
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <div style={{ ...styles.card, maxWidth: '600px', textAlign: 'center' }}>
                    <h2>Track Your Order</h2>
                    <p style={{ fontSize: '12px', color: '#666' }}>Enter the Order ID found on your receipt </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>#DF-[Order ID] </p>
                    
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <input 
                            style={{ ...styles.input, flex: 2 }} 
                            placeholder="e.g. 15" 
                            value={orderId} 
                            onChange={e => setOrderId(e.target.value)} 
                            required 
                        />
                        <button type="submit" style={{ ...styles.button, flex: 1, backgroundColor: res.accent_color, borderRadius: '50px' }}>
                            SEARCH
                        </button>
                    </form>

                    {orderData && (
                        <div style={resultCard}>
                            <h3 style={{ margin: '0 0 10px 0' }}>Status: 
                                <span style={{ color: orderData.status === 'Ready to serve' ? '#2e7d32' : res.accent_color }}>
                                    {" " + orderData.status.toUpperCase()}
                                </span>
                            </h3>
                            <div style={{ textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                <p><b>Order:</b> #DF-{orderData.id}</p>
                                <p><b>Items:</b> {orderData.items?.map(i => i.item_name).join(', ')}</p>
                                <p><b>Type:</b> {orderData.service_type.toUpperCase()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const resultCard = { marginTop: '30px', padding: '20px', border: '2px solid #eee', borderRadius: '12px', background: '#fcfcfc' };

export default OrderLookup;