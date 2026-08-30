import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const CouponManager = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [coupons, setCoupons] = useState([]);
    const [loyalty, setLoyalty] = useState({ points_earned: 0, per_purchase_amount: 0, offers_description: '' });
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [couponForm, setCouponForm] = useState({ code: '', discount_amount: '', min_purchase: '' });

    const fetchData = useCallback(async () => {
        if (!res.id) return;
        const [c, l] = await Promise.all([
            axios.get(`http://localhost:8000/api/coupons/${res.id}`),
            axios.get(`http://localhost:8000/api/loyalty-settings/${res.id}`)
        ]);
        setCoupons(c.data);
        if (l.data) setLoyalty(l.data);
    }, [res.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSaveCoupon = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:8000/api/coupons', { ...couponForm, restaurant_id: res.id });
        setShowCouponModal(false);
        fetchData();
    };

    const handleSaveLoyalty = async (e) => {
            e.preventDefault();
            try {
                await axios.post('http://localhost:8000/api/loyalty-settings', { ...loyalty, restaurant_id: res.id });
                
                // Update local storage so the description is cached
                const updatedRes = { ...res, offers_description: loyalty.offers_description };
                localStorage.setItem('restaurant', JSON.stringify(updatedRes));
                
                alert("Loyalty rules updated and live!");
            } catch (err) {
                alert("Failed to save rules.");
            }
        };
        
    return (
        <div style={styles.app}>
            <TopBar role="Manager" />
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                <h1 style={{ fontFamily: 'Verdana' }}>Coupons & Loyalty</h1>

                {/* 1. COUPON SECTION */}
                <div style={styles.wideCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3>Active Coupons</h3>
                        <button onClick={() => setShowCouponModal(true)} style={{ ...styles.button, width: 'auto', padding: '10px 20px', backgroundColor: res.accent_color }}>+ CREATE COUPON</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                        {coupons.map(c => (
                            <div key={c.id} style={couponChip}>
                                <strong>{c.code}</strong> (৳{c.discount_amount} off) 
                                <button onClick={async () => { await axios.delete(`http://localhost:8000/api/coupons/${c.id}`); fetchData(); }} style={chipDelBtn}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. LOYALTY SECTION */}
                <div style={{ ...styles.wideCard, marginTop: '30px' }}>
                    <h3>Loyalty Point Rules</h3>
                    <form onSubmit={handleSaveLoyalty}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <span>Earn</span>
                            <input style={{ ...styles.input, width: '80px' }} type="number" value={loyalty.points_earned} onChange={e => setLoyalty({ ...loyalty, points_earned: e.target.value })} />
                            <span>Points for every ৳</span>
                            <input style={{ ...styles.input, width: '100px' }} type="number" value={loyalty.per_purchase_amount} onChange={e => setLoyalty({ ...loyalty, per_purchase_amount: e.target.value })} />
                            <span>spent.</span>
                        </div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginTop: '15px' }}>OFFERS & REWARDS DESCRIPTION</label>
                        <textarea style={{ ...styles.input, height: '80px' }} value={loyalty.offers_description} onChange={e => setLoyalty({ ...loyalty, offers_description: e.target.value })} placeholder="e.g. 500 points = 1 Free Burger" />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, width: '200px' }}>SAVE RULES</button>
                    </form>
                </div>
            </div>

            {showCouponModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleSaveCoupon}>
                        <h3>New Coupon</h3>
                        <input placeholder="Coupon Code (e.g. SAVE10)" style={styles.input} onChange={e => setCouponForm({ ...couponForm, code: e.target.value })} required />
                        <input placeholder="Discount Amount (৳)" type="number" style={styles.input} onChange={e => setCouponForm({ ...couponForm, discount_amount: e.target.value })} required />
                        <input placeholder="Minimum Purchase (৳)" type="number" style={styles.input} onChange={e => setCouponForm({ ...couponForm, min_purchase: e.target.value })} required />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color }}>SAVE</button>
                        <button type="button" onClick={() => setShowCouponModal(false)} style={{ ...styles.button, background: '#444' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const couponChip = { background: '#f0f0f0', padding: '10px 20px', borderRadius: '50px', border: '1px solid #ddd', display: 'flex', gap: '10px', alignItems: 'center' };
const chipDelBtn = { background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };

export default CouponManager;