import React, { useState, useEffect } from 'react';
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
    
    // COUPON STATES
    const [coupons, setCoupons] = useState([]); // FIXED: Added missing coupons state
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    // FETCH COUPONS ON LOAD
    useEffect(() => {
        if (res.id) {
            axios.get(`http://localhost:8000/api/coupons/${res.id}`)
                .then(response => setCoupons(response.data))
                .catch(err => console.error("Failed to load coupons"));
        }
    }, [res.id]);

    const handleRemoveItem = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        if (newCart.length === 0) setDiscount(0); // Reset discount if cart emptied
    };

    const subTotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    const finalTotal = subTotal - discount;

    const applyCoupon = () => {
        const foundCoupon = coupons.find(c => c.code.trim().toUpperCase() === couponCode.trim().toUpperCase());

        if (foundCoupon) {
            if (subTotal >= parseFloat(foundCoupon.min_purchase)) {
                setDiscount(parseFloat(foundCoupon.discount_amount));
                alert(`✅ Coupon Applied! ৳${foundCoupon.discount_amount} off.`);
            } else {
                alert(`❌ This coupon requires a minimum purchase of ৳${foundCoupon.min_purchase}`);
                setDiscount(0);
            }
        } else {
            alert("❌ Invalid Coupon Code");
            setDiscount(0);
        }
    };

    const isKiosk = mode === 'kiosk' || window.location.pathname.includes('kiosk');

    const handleConfirm = async () => {
        if (cart.length === 0) return alert("Your cart is empty!");
        if (!paymentMethod) return alert("Please select a payment method");
        
        const customerName = isKiosk ? info.name : (customer?.name || info.name);
        const customerPhone = isKiosk ? info.phone : (customer?.phone || info.phone);

        if (!customerName || !customerPhone) {
            return alert("Please enter your name and phone number to receive your order & SMS confirmation");
        }

        const orderData = {
            restaurant_id: res.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            service_type: serviceType,
            total_price: finalTotal, // FIXED: Sends the discounted price
            payment_method: paymentMethod,
            items: cart 
        };

        try {
            if (paymentMethod === 'bkash') {
                // bKash logic
                const amountToSend = parseFloat(finalTotal).toFixed(2);
                localStorage.setItem('pending_bkash_order', JSON.stringify(orderData));
                localStorage.setItem('pending_bkash_mode', isKiosk ? 'kiosk' : 'website');

                const response = await axios.post('http://localhost:8000/api/bkash/create', {
                    total_price: amountToSend,
                    customer_phone: orderData.customer_phone
                });

                if (response.data.bkashURL) {
                    window.location.href = response.data.bkashURL;
                } else {
                    alert("bKash Error: " + (response.data.errorMessage || response.data.message || "Check credentials"));
                }
            } else {
                // Cash logic
                const response = await axios.post('http://localhost:8000/api/orders', orderData);
                if (response.data.status === 'success') {
                    const orderId = response.data.order_id;
                    const smsStatus = response.data.notification?.sms_sent 
                        ? "SMS sent to " + customerPhone 
                        : "Confirmation recorded for " + customerPhone;

                    alert(`✅ Order Confirmed! ID: #DF-${orderId}\n📱 ${smsStatus}`);
                    localStorage.removeItem('cart');

                    if (isKiosk) {
                        navigate('/kiosk');
                    } else {
                        navigate('/customer-order-progress');
                    }
                }
            }
        } catch (err) {
            console.error("Order submission error:", err);
            alert("Error saving order. Check console.");
        }
    };

    const pillBtn = { padding: '12px 25px', borderRadius: '50px', border: '1px solid #ddd', cursor: 'pointer', fontFamily: 'Verdana', fontWeight: 'bold', transition: '0.3s', fontSize: '12px' };

    return (
        <div style={styles.app}>
            <TopBar role={mode === 'kiosk' ? 'Kiosk' : 'Public'} />
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <div style={styles.wideCard}>
                    <h2 style={{ fontFamily: 'Verdana', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Checkout Summary</h2>
                    
                    {cart.map((item, idx) => (
                        <div key={idx} style={itemRowStyle}>
                            <div style={{ flex: 1 }}>
                                <strong>{item.name}</strong> <small>({item.variant})</small>
                                {item.note && <p style={{ fontSize: '11px', color: res.accent_color, margin: '5px 0' }}>Note: {item.note}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <span>{item.quantity} x ৳{item.price} = <b>৳{item.quantity * item.price}</b></span>
                                <button onClick={() => handleRemoveItem(idx)} style={deleteBtnStyle}>❌</button>
                            </div>
                        </div>
                    ))}

                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <p style={{ color: '#888', margin: 0 }}>Subtotal: ৳{subTotal}</p>
                        {discount > 0 && <p style={{ color: 'green', margin: 0 }}>Coupon Discount: -৳{discount}</p>}
                        <h3 style={{ fontSize: '24px', marginTop: '5px' }}>Total Amount: ৳{finalTotal}</h3>
                    </div>

                    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        
                        {/* COUPON SECTION */}
                        <label style={lbl}>Discount Coupon</label>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                            <input 
                                style={{ ...styles.input, flex: 3, margin: 0 }} 
                                placeholder="Enter code (e.g. SAVE10)" 
                                value={couponCode}
                                onChange={e => setCouponCode(e.target.value)} 
                            />
                            <button onClick={applyCoupon} style={{ ...styles.button, flex: 1, backgroundColor: '#333', margin: 0, borderRadius: '8px' }}>APPLY</button>
                        </div>

                        {isKiosk || !customer ? (
                            <>
                                <label style={lbl}>Customer Details (for SMS Order Updates)</label>
                                <input 
                                    style={styles.input} 
                                    placeholder="Enter Your Name" 
                                    value={info.name}
                                    onChange={e => setInfo({...info, name: e.target.value})} 
                                />
                                <input 
                                    style={styles.input} 
                                    placeholder="Enter Phone Number (e.g. 01712345678)" 
                                    value={info.phone}
                                    onChange={e => setInfo({...info, phone: e.target.value})} 
                                />
                            </>
                        ) : (
                            <div style={{marginBottom: '20px', background: '#f8f9fa', padding: '12px', borderRadius: '8px'}}>
                                <p style={{margin: 0}}>Ordering as: <b>{customer.name}</b> ({customer.phone})</p>
                                <small style={{color: '#666'}}>Order confirmation & tracking SMS will be sent to this number.</small>
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
                                <input type="number" style={styles.input} placeholder="Amount received" onChange={e => setCashReceived(e.target.value)} />
                                {parseFloat(cashReceived) >= finalTotal && (
                                    <p style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: '10px' }}>Change to Return: ৳{(parseFloat(cashReceived) - finalTotal).toFixed(2)}</p>
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

const itemRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f4f4f4' };
const deleteBtnStyle = { background: 'white', color: '#ff4d4d', border: '1px solid #eee', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' };
const lbl = { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '10px', display: 'block' };

export default Checkout;