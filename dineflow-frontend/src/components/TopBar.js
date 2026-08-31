import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const TopBar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredBtn, setHoveredBtn] = useState(null);
    const [livePoints, setLivePoints] = useState(0);

    // Get Data
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1', restaurant_name: 'DineFlow' };
    const customer = JSON.parse(localStorage.getItem('customer'));

    // --- 1. DEFINE MENU LAYOUTS ---
    const menuConfigs = {
        Admin: ['Employees', 'Inventory', 'Menu', 'Order Progress', 'Coupons', 'Reservations', 'Waste Management', 'Finances', 'Settings'],
        Manager: ['Dashboard', 'Employees',  'Menu', 'Order Progress', 'Coupons', 'Inventory', 'Waste Management', 'Reservations', 'Finances'],
        Staff: ['Dashboard', 'Menu', 'Order Progress', 'Inventory', 'Waste Management', 'Reservations'],
        Public: customer 
            ? ['Menu', 'Reservations', 'Review', 'Order Progress', 'Purchase History', 'Profile', 'Cart'] 
            : ['Menu', 'Cart'],
        Kiosk: [] 
    };

    // --- 2. SELECT THE BUTTONS ---
    // We use the 'role' passed from the page. If on a login page, we show nothing.
    const isAuthPage = location.pathname.includes('auth') || location.pathname === '/' || location.pathname === '/register';
    const menuItems = isAuthPage ? [] : (menuConfigs[role] || []);

    // --- 3. LIVE POINTS SYNC ---
    useEffect(() => {
        if (customer && customer.id) {
            axios.get(`http://localhost:8000/api/customer/points/${customer.id}`)
                .then(response => setLivePoints(response.data.loyalty_points))
                .catch(err => console.error("Points fetch failed"));
        }
    }, [customer?.id, location.pathname]); 

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalQuantity = cart.reduce((acc, obj) => acc + parseInt(obj.quantity || 0), 0);

    const handleNavigation = (item) => {
        if (role === "Public") {
            if (item === 'Menu') return navigate('/customer-website');
            if (item === 'Cart') return navigate('/checkout-public');
            if (item === 'Purchase History') return navigate('/purchase-history');
            if (item === 'Review') return navigate('/reviews');
            if (item === 'Order Progress') return navigate('/customer-order-progress');
            
             if (item === 'Reservations') return navigate('/customer-reservations');
            return; 
        }

        const routeMap = {
            'Employees': role === 'Admin' ? '/admin-panel' : '/manager-employees',
            'Inventory': '/inventory',
            'Menu': '/menu-management',
            'Coupons': '/coupons', 
            'Order Progress': '/staff-order-progress',
            'Settings': '/admin-profile',
            'Waste Management' : '/waste-management',
            'Reservations': '/staff-reservations',
            'Finances': '/finances',
            'Dashboard': (role === 'Manager' ) ? '/manager-dashboard' : '/staff-dashboard',
        };
        if (routeMap[item]) navigate(routeMap[item]);
    };

    const handleRightBtn = () => {
        if (role === "Kiosk") return navigate('/checkout-kiosk');
        
        if (role === "Public") {
            if (customer) { 
                localStorage.removeItem('customer'); 
                navigate('/customer-website'); 
                window.location.reload(); 
            } else { navigate('/customer-auth'); }
        } else {
            localStorage.clear();
            navigate('/');
        }
    };

    const styles = {
        container: { position: 'fixed', top: 0, left: 0, right: 0, height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', color: 'white', zIndex: 1000, backgroundColor: res.accent_color, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontFamily: 'Verdana' },
        leftSection: { display: 'flex', alignItems: 'center', gap: '15px', flex: '0 0 280px' },
        middleSection: { display: 'flex', justifyContent: 'center', flex: 1, gap: '2px', alignItems: 'center' },
        rightSection: { display: 'flex', justifyContent: 'flex-end', flex: '0 0 280px', alignItems: 'center', gap: '15px' },
        logo: { width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'white', objectFit: 'cover', border: '2px solid white', cursor: 'pointer' },
        navBtn: (isHovered) => ({ background: isHovered ? 'rgba(255,255,255,0.25)' : 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '9px', padding: '10px 10px', borderRadius: '4px', textTransform: 'uppercase', fontFamily: 'Verdana', transition: '0.2s', filter: isHovered ? 'brightness(1.2)' : 'none' }),
        capsuleBtn: { backgroundColor: 'white', color: res.accent_color, border: 'none', padding: '10px 22px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'Verdana', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },
        loyaltyBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '50px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Verdana' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.leftSection}>
                <img src={`http://localhost:8000/storage/${res.logo}`} style={styles.logo} alt="L" onDoubleClick={() => role === "Kiosk" && navigate('/exit-public-auth')} onError={e => e.target.src="https://via.placeholder.com/40"} />
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{res.restaurant_name}</span>
            </div>
            <div style={styles.middleSection}>
                {menuItems.map(item => (
                    <button key={item} style={styles.navBtn(hoveredBtn === item)} onMouseEnter={() => setHoveredBtn(item)} onMouseLeave={() => setHoveredBtn(null)} onClick={() => handleNavigation(item)}>
                        {item === 'Cart' ? `CART (${totalQuantity})` : item}
                    </button>
                ))}
            </div>
            <div style={styles.rightSection}>
                {role === "Public" && customer && <button style={styles.loyaltyBtn} onClick={() => alert("Perks: " + res.offers_description)}>💎 {livePoints} PTS</button>}
                <button style={styles.capsuleBtn} onClick={handleRightBtn}>
                    {role === "Kiosk" ? "Checkout" : (role === "Public" ? (customer ? "Sign Out" : "Sign In") : "Log Out")}
                </button>
            </div>
        </div>
    );
};

export default TopBar;