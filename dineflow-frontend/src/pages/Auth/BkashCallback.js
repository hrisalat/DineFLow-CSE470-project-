import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BkashCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');

        if (status === 'success') {
            alert("Payment Received via bKash! Order Confirmed.");
            localStorage.removeItem('cart'); // Clear cart
            navigate('/customer-website');
        } else {
            alert("Payment Cancelled.");
            navigate('/checkout-public');
        }
    }, [location, navigate]);

    return (
        <div style={{ textAlign: 'center', paddingTop: '100px', fontFamily: 'Verdana' }}>
            <h2>Verifying bKash Payment...</h2>
        </div>
    );
};

export default BkashCallback;