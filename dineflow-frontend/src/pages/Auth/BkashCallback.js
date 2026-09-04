import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { generateReceiptPdf } from '../../utils/generateReceiptPdf';

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
            const paymentID = params.get('paymentID');
            const amount = params.get('amount');
            const pendingMode = localStorage.getItem('pending_bkash_mode') || 'website';
            const rawOrder = localStorage.getItem('pending_bkash_order');

            if (status === 'success' || !status) {
                try {
                    // Call executePayment API if paymentID exists
                    if (paymentID) {
                        try {
                            await axios.post('http://localhost:8000/api/bkash/execute', {
                                paymentID: paymentID,
                                amount: amount
                            });
                        } catch (execErr) {
                            console.warn("bKash execute warning:", execErr);
                        }
                    }

                    let createdOrderId = null;
                    if (rawOrder) {
                        const orderData = JSON.parse(rawOrder);
                        const response = await axios.post('http://localhost:8000/api/orders', orderData);
                        
                        if (response.data.status === 'success') {
                            createdOrderId = response.data.order_id;
                        }
                    }

                    // Clean up stored state
                    localStorage.removeItem('cart');
                    localStorage.removeItem('pending_bkash_order');
                    localStorage.removeItem('pending_bkash_mode');

                    if (pendingMode === 'kiosk') {
                        if (createdOrderId) {
                            navigate(`/kiosk-receipt/${createdOrderId}`);
                        } else {
                            navigate('/kiosk');
                        }
                    } else {
                        alert("✅ Payment Received via bKash! Order Confirmed.\nDownloading your receipt...");
                        if (createdOrderId && rawOrder) {
                            generateReceiptPdf({ ...JSON.parse(rawOrder), id: createdOrderId });
                        }
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