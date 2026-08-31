import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BkashCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const status = params.get('status');
            const pendingMode = localStorage.getItem('pending_bkash_mode') || 'website';
            const rawOrder = localStorage.getItem('pending_bkash_order');

            if (status === 'success') {
                try {
                    if (rawOrder) {
                        const orderData = JSON.parse(rawOrder);
                        const response = await axios.post('http://localhost:8000/api/orders', orderData);
                        
                        if (response.data.status === 'success') {
                            const orderId = response.data.order_id;
                            const smsStatus = response.data.notification?.sms_sent 
                                ? "SMS sent to " + (orderData.customer_phone || "your phone")
                                : "Confirmation recorded for " + (orderData.customer_phone || "your phone");

                            alert(`✅ Payment Received via bKash!\nOrder Confirmed ID: #DF-${orderId}\n📱 ${smsStatus}`);
                        }
                    } else {
                        alert("✅ Payment Received via bKash! Order Confirmed.");
                    }

                    // Clean up stored state
                    localStorage.removeItem('cart');
                    localStorage.removeItem('pending_bkash_order');
                    localStorage.removeItem('pending_bkash_mode');

                    if (pendingMode === 'kiosk') {
                        navigate('/kiosk');
                    } else {
                        navigate('/customer-order-progress');
                    }
                } catch (err) {
                    console.error("Failed to complete bKash order:", err);
                    alert("Payment received, but error recording order. Please contact staff with your payment ID.");
                    navigate(pendingMode === 'kiosk' ? '/kiosk' : '/customer-website');
                }
            } else {
                alert("❌ bKash Payment Cancelled or Failed.");
                localStorage.removeItem('pending_bkash_order');
                localStorage.removeItem('pending_bkash_mode');
                navigate(pendingMode === 'kiosk' ? '/checkout-kiosk' : '/checkout-public');
            }
        };

        handleCallback();
    }, [location, navigate]);

    return (
        <div style={{ textAlign: 'center', paddingTop: '100px', fontFamily: 'Verdana' }}>
            <h2>Verifying bKash Payment...</h2>
            <p style={{ color: '#888' }}>Please wait while we confirm your payment and place your order.</p>
        </div>
    );
};

export default BkashCallback;