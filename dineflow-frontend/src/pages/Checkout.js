import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar'; // Check this path!
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
    };

    const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0);

    const handleConfirm = async () => {
        if (cart.length === 0) return alert("Cart is empty");
        if (!paymentMethod) return alert("Select a payment method");
        alert("Order Confirmed!"); 
        localStorage.removeItem('cart');
        navigate(mode === 'kiosk' ? '/kiosk' : '/customer-website');
    };

    const pillBtn = { padding: '12px 25px', borderRadius: '50px', border: '1px solid #ddd', cursor: 'pointer', fontFamily: 'Verdana', fontWeight: 'bold', transition: '0.3s' };

    return (
        <div style={styles.app}>
            <TopBar role={mode === 'kiosk' ? 'Kiosk' : 'Public'} />
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <div style={styles.wideCard}>
                    <h2 style={{ fontFamily: 'Verdana' }}>Checkout Summary</h2>
                    
                    {cart.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f4f4f4' }}>
                            <div style={{ flex: 1 }}>
                                <strong>{item.name}</strong> <small>({item.variant})</small>
                                {item.note && <p style={{ fontSize: '11px', color: '#888' }}>Note: {item.note}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <span>{item.quantity} x ৳{item.price} = <b>৳{item.quantity * item.price}</b></span>
                                <button onClick={() => handleRemoveItem(idx)} style={{ background: 'white', color: '#ff4d4d', border: '1px solid #eee', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>❌</button>
                            </div>
                        </div>
                    ))}

                    <h3 style={{ textAlign: 'right', marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '15px' }}>Total: ৳{totalPrice}</h3>

                    <div style={{ marginTop: '30px' }}>
                        {mode === 'kiosk' ? (
                            <>
                                <input style={styles.input} placeholder="Enter Your Name" onChange={e => setInfo({...info, name: e.target.value})} />
                                <input style={styles.input} placeholder="Enter Phone Number" onChange={e => setInfo({...info, phone: e.target.value})} />
                            </>
                        ) : !customer ? (
                            <div style={{ padding: '20px', textAlign: 'center', background: '#fff9c4', borderRadius: '10px' }}>
                                <p>Please Sign In to complete your order.</p>
                                <button onClick={() => navigate('/customer-auth')} style={styles.button}>GO TO SIGN IN</button>
                            </div>
                        ) : null}

                        <h4 style={{ marginTop: '30px' }}>Service Type:</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setServiceType('dine-in')} style={{ ...pillBtn, backgroundColor: serviceType === 'dine-in' ? res.accent_color : 'white', color: serviceType === 'dine-in' ? 'white' : '#333' }}>DINE-IN</button>
                            <button onClick={() => setServiceType('takeaway')} style={{ ...pillBtn, backgroundColor: serviceType === 'takeaway' ? res.accent_color : 'white', color: serviceType === 'takeaway' ? 'white' : '#333' }}>TAKE AWAY</button>
                        </div>

                        <h4 style={{ marginTop: '30px' }}>Payment Method:</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setPaymentMethod('cash')} style={{ ...pillBtn, backgroundColor: paymentMethod === 'cash' ? res.accent_color : 'white', color: paymentMethod === 'cash' ? 'white' : '#333' }}>CASH</button>
                            <button onClick={() => setPaymentMethod('bkash')} style={{ ...pillBtn, backgroundColor: paymentMethod === 'bkash' ? '#E2136E' : 'white', color: paymentMethod === 'bkash' ? 'white' : '#333' }}>BKASH</button>
                        </div>

                        {paymentMethod === 'cash' && (
                            <div style={{ marginTop: '20px' }}>
                                <input type="number" style={styles.input} placeholder="Amount Received" onChange={e => setCashReceived(e.target.value)} />
                                {cashReceived >= totalPrice && <p style={{ color: 'green', fontWeight: 'bold' }}>Change: ৳{cashReceived - totalPrice}</p>}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '50px' }}>
                            <button onClick={handleConfirm} style={{ ...styles.button, backgroundColor: res.accent_color, flex: 2 }}>CONFIRM ORDER</button>
                            <button onClick={() => { localStorage.removeItem('cart'); navigate(-1); }} style={{ ...styles.button, background: '#888', flex: 1 }}>CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout; // CRUCIAL: Must have this line!