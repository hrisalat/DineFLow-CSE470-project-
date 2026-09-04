import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

import { generateReceiptPdf } from '../utils/generateReceiptPdf';

const KioskReceipt = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };

    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);

    const kioskReceiptUrl = `http://localhost:3000/kiosk-receipt/${orderId}`;

    useEffect(() => {
        if (!order && orderId) {
            axios.get(`http://localhost:8000/api/order-lookup/${orderId}`)
                .then(response => {
                    setOrder(response.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching order details:", err);
                    setLoading(false);
                });
        }
    }, [orderId, order]);

    const handleNewOrder = () => {
        localStorage.removeItem('cart');
        navigate('/kiosk');
    };

    const handleDownloadPdf = () => {
        if (order) {
            generateReceiptPdf(order);
        }
    };

    if (loading) {
        return (
            <div style={styles.app}>
                <TopBar role="Kiosk" />
                <div style={{ ...styles.container, paddingTop: '120px', textAlign: 'center' }}>
                    <h2>Loading Receipt Details...</h2>
                </div>
            </div>
        );
    }

    if (!order || order.status === 'error') {
        return (
            <div style={styles.app}>
                <TopBar role="Kiosk" />
                <div style={{ ...styles.container, paddingTop: '120px', textAlign: 'center' }}>
                    <h2>Order Not Found</h2>
                    <button onClick={handleNewOrder} style={{ ...styles.button, backgroundColor: res.accent_color, marginTop: '20px' }}>
                        Start New Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.app}>
            <TopBar role="Kiosk" />
            <div style={{ ...styles.container, padding: '100px 20px 40px' }}>
                <div style={{ ...styles.wideCard, maxWidth: '650px', margin: '0 auto', padding: '30px' }}>
                    
                    {/* CONFIRMATION HEADER */}
                    <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px dashed #eee', paddingBottom: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                        <h2 style={{ fontFamily: 'Verdana', margin: '0 0 5px 0', color: '#2e7d32' }}>Order Confirmed!</h2>
                        <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Thank you! Your order has been successfully placed.</p>
                    </div>

                    {/* RECEIPT SUMMARY */}
                    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
                        <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #ddd', paddingBottom: '8px', fontSize: '16px' }}>Receipt Details</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', marginBottom: '15px' }}>
                            <div><strong>Order No:</strong> #DF-{order.id}</div>
                            <div><strong>Phone Number:</strong> {order.customer_phone || 'N/A'}</div>
                            {order.customer_name && <div><strong>Customer Name:</strong> {order.customer_name}</div>}
                            <div><strong>Payment Method:</strong> {(order.payment_method || '').toUpperCase()}</div>
                            <div><strong>Service Type:</strong> {(order.service_type || '').toUpperCase()}</div>
                        </div>

                        {/* ITEMS TABLE */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left', color: '#555' }}>
                                    <th style={{ padding: '8px 0' }}>Item</th>
                                    <th style={{ padding: '8px 0', textAlign: 'center' }}>Qty</th>
                                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.items || []).map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px 0' }}>{item.item_name}</td>
                                        <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '8px 0', textAlign: 'right' }}>৳{(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ textAlign: 'right', marginTop: '15px', paddingTop: '10px', borderTop: '2px solid #333', fontSize: '18px', fontWeight: 'bold' }}>
                            Total: ৳{parseFloat(order.total_price || 0).toFixed(2)}
                        </div>
                    </div>

                    {/* QR CODE SECTION */}
                    <div style={{ textAlign: 'center', backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Scan to View & Download Receipt</h4>
                        <div style={{ padding: '15px', background: '#fff', display: 'inline-block', borderRadius: '8px', border: '1px solid #eee' }}>
                            <QRCodeSVG value={kioskReceiptUrl} size={160} level="H" />
                        </div>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', marginBottom: 0 }}>
                            Scan this QR code with your mobile camera to view and download your PDF receipt.
                        </p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                        <button 
                            onClick={handleDownloadPdf} 
                            style={{ ...styles.button, backgroundColor: '#333', color: 'white', borderRadius: '50px', padding: '14px' }}
                        >
                            📄 Download PDF Receipt
                        </button>

                        <button 
                            onClick={handleNewOrder} 
                            style={{ ...styles.button, backgroundColor: res.accent_color, color: 'white', borderRadius: '50px', padding: '14px', fontSize: '16px', fontWeight: 'bold' }}
                        >
                            ➕ NEW ORDER
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default KioskReceipt;
