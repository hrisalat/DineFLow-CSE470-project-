import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TopBar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredBtn, setHoveredBtn] = useState(null);

    // 1. Get Data from storage
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1', restaurant_name: 'DineFlow' };
    
    let customer = null;
    try {
        const savedCustomer = localStorage.getItem('customer');
        if (savedCustomer && savedCustomer !== "undefined") {
            customer = JSON.parse(savedCustomer);
        }
    } catch (e) {
        console.error("Error parsing customer data");
    }

    // --- FIX: CALCULATE TOTAL QUANTITY (e.g. 3 Mojo + 1 Pizza = 4 items) ---
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalQuantity = cart.reduce((acc, obj) => acc + parseInt(obj.quantity || 0), 0);

    // 2. Detection for Auth Pages
    const isAuthPage = location.pathname.includes('auth') || location.pathname === '/' || location.pathname === '/register';
    const isPublic = role === "Public";
    const isKiosk = role === "Kiosk";

    // 3. Define Menu Layouts based on Role
    const menuConfigs = {
        Admin: ['Employees', 'Inventory', 'Menu', 'Coupons', 'Reservations', 'Waste Management', 'Finances', 'Profile'],
        Manager: ['Dashboard', 'Employees', 'Inventory', 'Menu', 'Coupons', 'Reservations', 'Waste Management', 'Finances'],
        Staff: ['Dashboard', 'Take Order', 'Menu', 'Inventory','Order Progress', 'Reservations', 'Waste Management', 'Finances'],
        Public: customer 
            ? ['Menu', 'Review', 'Purchase History', 'Profile', 'Cart'] 
            : ['Menu', 'Cart'],
        Kiosk: [] 
    };

    const menuItems = isAuthPage ? [] : (menuConfigs[role] || []);

    // 4. Navigation Logic
    const handleNavigation = (item) => {
        if (isPublic && item === 'Menu') return navigate('/customer-website');
        if (item === 'Cart') return navigate('/checkout-public');

        const routeMap = {
            'Employees': role === 'Admin' ? '/admin-panel' : '/manager-employees',
            'Inventory': '/inventory',
            'Menu': '/menu-management',
            'Profile': '',
            'Dashboard': role === 'Manager' ? '/manager-dashboard' : '/staff-dashboard',
        };

        if (routeMap[item]) navigate(routeMap[item]);
    };

    const handleRightBtn = () => {
        if (isKiosk) {
            navigate('/checkout-kiosk');
        } else if (isPublic) {
            if (customer) {
                localStorage.removeItem('customer');
                window.location.reload();
            } else {
                navigate('/customer-auth');
            }
        } else {
            const path = location.pathname;
            const isSubProfile = path.includes('panel') || path.includes('employees') || path.includes('dashboard') || path.includes('auth') || path.includes('profile') || path.includes('inventory') || path.includes('menu');
            if (isSubProfile && path !== '/dashboard') {
                navigate('/employee-view');
            } else {
                localStorage.clear();
                navigate('/');
            }
        }
    };

    const styles = {
        container: { 
            position: 'fixed', top: 0, left: 0, right: 0, height: '70px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '0 30px', color: 'white', zIndex: 1000, 
            backgroundColor: res.accent_color, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontFamily: 'Verdana'
        },
        leftSection: { display: 'flex', alignItems: 'center', gap: '15px', flex: '0 0 280px' },
        middleSection: { display: 'flex', justifyContent: 'center', flex: 1, gap: '2px', alignItems: 'center' },
        rightSection: { display: 'flex', justifyContent: 'flex-end', flex: '0 0 280px', alignItems: 'center', gap: '15px' },
        logo: { width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'white', objectFit: 'cover', border: '2px solid white', cursor: 'pointer' },
        navBtn: (isHovered) => ({
            background: isHovered ? 'rgba(255,255,255,0.25)' : 'none',
            border: 'none', color: 'white', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '9px', padding: '10px 10px',
            borderRadius: '4px', textTransform: 'uppercase', transition: '0.2s',
            filter: isHovered ? 'brightness(1.2)' : 'none'
        }),
        capsuleBtn: {
            backgroundColor: 'white',
            color: res.accent_color,
            border: 'none',
            padding: '10px 22px',
            borderRadius: '50px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '11px',
            textTransform: 'uppercase',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.leftSection}>
                <img 
                    src={`http://localhost:8000/storage/${res.logo}`} 
                    style={styles.logo} 
                    alt="Logo" 
                    onDoubleClick={() => isKiosk && navigate('/exit-public-auth')}
                    onError={e => e.target.src="https://via.placeholder.com/40"} 
                />
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{res.restaurant_name}</span>
            </div>

            <div style={styles.middleSection}>
                {!isAuthPage && menuItems.map(item => (
                    <button 
                        key={item} 
                        style={styles.navBtn(hoveredBtn === item)}
                        onMouseEnter={() => setHoveredBtn(item)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        onClick={() => handleNavigation(item)}
                    >
                        {/* FIX: Use item here inside the loop */}
                        {item === 'Cart' ? `CART (${totalQuantity})` : item}
                    </button>
                ))}
            </div>

            <div style={styles.rightSection}>
                {isKiosk && !isAuthPage && (
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                        {totalQuantity} ITEMS SELECTED
                    </span>
                )}
                <button style={styles.capsuleBtn} onClick={handleRightBtn}>
                    {isKiosk ? "Checkout" : (isPublic ? (customer ? "Sign Out" : "Sign In") : "Log Out")}
                </button>
            </div>
        </div>
    );
};

export default TopBar;