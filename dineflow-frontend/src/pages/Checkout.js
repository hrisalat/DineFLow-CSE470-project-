import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const Checkout = ({ mode }) => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    const customer = JSON.parse(localStorage.getItem('customer'));
    
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
    const [info, setInfo] = useState({ name: '', phone: '' });
    const [serviceType, setServiceType] = useState('dine-in'); 
    const [paymentMethod, setPaymentMethod] = useState(''); 
    const [cashReceived, setCashReceived] = useState('');
    
    const handleRemoveItem = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        // Force a small refresh to update TopBar count if necessary
    };

    const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0);

    
    const savedCustomer = JSON.parse(localStorage.getItem('customer'));

const orderData = {
    restaurant_id: res.id,
    customer_name: mode === 'kiosk' ? info.name : savedCustomer?.name,
    customer_phone: mode === 'kiosk' ? info.phone : savedCustomer?.phone, // MUST be phone
    service_type: serviceType,
    total_price: totalPrice,
    payment_method: paymentMethod,
    items: cart 
};
const handleConfirm = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (!paymentMethod) return alert("Select a payment method");
     const cleanAmount = parseFloat(totalPrice).toFixed(2);

    // --- LOGIC FOR CASH ---
    if (paymentMethod === 'cash') {
        const orderData = {
            restaurant_id: res.id,
            customer_name: mode === 'kiosk' ? info.name : customer?.name,
            customer_phone: mode === 'kiosk' ? info.phone : customer?.phone,
            service_type: serviceType,
            total_price: totalPrice,
            payment_method: 'cash',
            items: cart
        };
        try {
            await axios.post('http://localhost:8000/api/orders', orderData);
            alert("Order Confirmed (Cash)");
            localStorage.removeItem('cart');
            navigate(mode === 'kiosk' ? '/kiosk' : '/customer-website');
        } catch (e) { alert("Error saving order"); }
    } 

    // --- LOGIC FOR BKASH ---
    // src/pages/Checkout.js

// src/pages/Checkout.js

 else  if (paymentMethod === 'bkash') {
        try {
            const response = await axios.post('http://localhost:8000/api/bkash/create', {
                total_price: cleanAmount,
                customer_phone: customer?.phone || info.phone
            });

            if (response.data.bkashURL) {
                // REDIRECT TO PINK SCREEN
                window.location.href = response.data.bkashURL;
            } else {
                alert("bKash Error: " + (response.data.errorMessage || "Check credentials"));
                console.log(response.data);
            }
        } catch (err) {
            alert("Backend Failure: Check Laravel Terminal or phpMyAdmin logs.");
        }
    
}
};
    const pillBtn = { 
        padding: '12px 25px', 
        borderRadius: '50px', 
        border: '1px solid #ddd', 
        cursor: 'pointer', 
        fontFamily: 'Verdana', 
        fontWeight: 'bold', 
        transition: '0.3s',
        fontSize: '12px'
    };

    return (
        <div style={styles.app}>
            <TopBar role={mode === 'kiosk' ? 'Kiosk' : 'Public'} />
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <div style={styles.wideCard}>
                    <h2 style={{ fontFamily: 'Verdana', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Checkout Summary</h2>
                    
                    {cart.length === 0 ? (
                        <p style={{textAlign: 'center', padding: '40px', color: '#999'}}>Your cart is empty.</p>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f4f4f4' }}>
                                <div style={{ flex: 1 }}>
                                    <strong style={{fontSize: '16px'}}>{item.name}</strong> <small style={{color: '#666'}}>({item.variant})</small>
                                    {item.note && <p style={{ fontSize: '11px', color: res.accent_color, margin: '5px 0' }}>Note: {item.note}</p>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{fontFamily: 'Verdana'}}>{item.quantity} x ৳{item.price} = <b>৳{item.quantity * item.price}</b></span>
                                    <button 
                                        onClick={() => handleRemoveItem(idx)} 
                                        style={{ background: 'white', color: '#ff4d4d', border: '1px solid #eee', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    <h3 style={{ textAlign: 'right', marginTop: '20px', fontSize: '22px' }}>Total: ৳{totalPrice}</h3>

                    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        {mode === 'kiosk' ? (
                            <>
                                <label style={lbl}>Customer Details</label>
                                <input style={styles.input} placeholder="Enter Your Name" onChange={e => setInfo({...info, name: e.target.value})} />
                                <input style={styles.input} placeholder="Enter Phone Number" onChange={e => setInfo({...info, phone: e.target.value})} />
                            </>
                        ) : !customer ? (
                            <div style={{ padding: '20px', textAlign: 'center', background: '#fff9c4', borderRadius: '12px', marginBottom: '20px' }}>
                                <p style={{fontWeight: 'bold', margin: '0 0 10px 0'}}>You are checking out as a Guest.</p>
                                <p style={{fontSize: '12px', marginBottom: '15px'}}>Sign in to save this order to your purchase history.</p>
                                <button onClick={() => navigate('/customer-auth')} style={{...styles.button, width: 'auto', padding: '10px 30px', backgroundColor: '#333'}}>GO TO SIGN IN</button>
                            </div>
                        ) : (
                            <div style={{marginBottom: '20px'}}>
                                <p>Ordering as: <b>{customer.name}</b> ({customer.phone})</p>
                            </div>
                        )}

                        <h4 style={lbl}>Are you planning to?</h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <button onClick={() => setServiceType('dine-in')} style={{ ...pillBtn, backgroundColor: serviceType === 'dine-in' ? res.accent_color : 'white', color: serviceType === 'dine-in' ? 'white' : '#333' }}>DINE-IN</button>
                            <button onClick={() => setServiceType('takeaway')} style={{ ...pillBtn, backgroundColor: serviceType === 'takeaway' ? res.accent_color : 'white', color: serviceType === 'takeaway' ? 'white' : '#333' }}>TAKE AWAY</button>
                        </div>

                        <h4 style={lbl}>Payment Method</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setPaymentMethod('cash')} style={{ ...pillBtn, backgroundColor: paymentMethod === 'cash' ? res.accent_color : 'white', color: paymentMethod === 'cash' ? 'white' : '#333' }}>CASH</button>
                            <button onClick={() => setPaymentMethod('bkash')} style={{ ...pillBtn, backgroundColor: paymentMethod === 'bkash' ? '#E2136E' : 'white', color: paymentMethod === 'bkash' ? 'white' : '#333', border: paymentMethod === 'bkash' ? 'none' : '1px solid #ddd' }}>BKASH</button>
                        </div>

                        {paymentMethod === 'cash' && (
                            <div style={{ marginTop: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                                <label style={{fontSize: '12px', fontWeight: 'bold'}}>Cash Received</label>
                                <input type="number" style={styles.input} placeholder="Amount received from customer" onChange={e => setCashReceived(e.target.value)} />
                                {parseFloat(cashReceived) >= totalPrice && (
                                    <p style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: '10px' }}>Change to Return: ৳{(parseFloat(cashReceived) - totalPrice).toFixed(2)}</p>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px', marginTop: '50px' }}>
                            <button onClick={handleConfirm} style={{ ...styles.button, backgroundColor: res.accent_color, flex: 2, borderRadius: '50px' }}>CONFIRM ORDER</button>
                            <button onClick={() => { localStorage.removeItem('cart'); navigate(-1); }} style={{ ...styles.button, background: '#666', flex: 1, borderRadius: '50px' }}>CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const lbl = { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '10px', display: 'block' };

export default Checkout;