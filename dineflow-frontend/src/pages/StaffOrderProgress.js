import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const StaffOrderProgress = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [orders, setOrders] = useState([]);

    const fetchAllOrders = useCallback(async () => {
        if (!res.id) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/orders/all/${res.id}`);
            setOrders(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Staff fetch failed", err);
        }
    }, [res.id]);

    useEffect(() => {
        fetchAllOrders();
        const interval = setInterval(fetchAllOrders, 10000); // Refresh every 10s for kitchen
        return () => clearInterval(interval);
    }, [fetchAllOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.post(`http://localhost:8000/api/orders/update-status/${orderId}`, { status: newStatus });
            fetchAllOrders(); 
        } catch (err) { alert("Failed to update status"); }
    };

    return (
        <div style={styles.app}>
            <TopBar role={res.position || "Admin"} />
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <div style={styles.wideCard}>
                    <h2 style={{ fontFamily: 'Verdana', color: res.accent_color }}>Kitchen Order Management</h2>
                    {orders.length === 0 ? <p style={{textAlign:'center', padding:'40px'}}>No orders in queue.</p> : 
                        orders.map(order => (
                            <div key={order.id} style={orderBox}>
                                <div style={{ flex: 1 }}>
                                    <strong>Order #DF-{order.id}</strong> - ৳{order.total_price} <br/>
                                    <small>{order.customer_name} | {order.service_type.toUpperCase()}</small>
                                    <div style={{marginTop: '5px'}}>
                                        {order.items?.map((i, idx) => (
                                            <span key={idx} style={itemBadge}>{i.item_name} x{i.quantity}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <select 
                                        style={{...styles.input, width: '150px'}} 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    >
                                        <option value="Waiting">waiting</option>
                                        <option value="Preparing">Preparing</option>
                                        <option value="Ready to serve">Ready to serve</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

const orderBox = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee' };
const itemBadge = { fontSize: '10px', background: '#eee', padding: '3px 8px', borderRadius: '4px', marginRight: '5px', border: '1px solid #ddd' };

export default StaffOrderProgress;