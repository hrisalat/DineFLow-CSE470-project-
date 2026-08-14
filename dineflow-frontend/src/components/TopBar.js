import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TopBar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredBtn, setHoveredBtn] = useState(null);

    // 1. Get Restaurant and Customer data from storage
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

    // 2. Detection for Auth Pages (to hide middle buttons)
    const isAuthPage = location.pathname.includes('auth') || location.pathname === '/' || location.pathname === '/register';
    const isPublic = role === "Public";
    const isKiosk = role === "Kiosk";

    // 3. Define Menu Layouts based on Role
    const menuConfigs = {
        Admin: ['Employees', 'Inventory', 'Menu', 'Coupons', 'Reservations', 'Waste Management', 'Finances', 'Profile'],
        Manager: ['Dashboard', 'Employees', 'Inventory', 'Menu', 'Coupons', 'Reservations', 'Waste Management', 'Finances'],
        Staff: ['Dashboard', 'Take Order', 'Menu', 'Inventory', 'Order Progress', 'Reservations', 'Waste Management', 'Finances'],
        Public: customer ? ['Menu', 'Review', 'Purchase History', 'Profile'] : ['Menu', 'Cart'],
        Kiosk: [] // Kiosk has no middle buttons
    };

    const menuItems = isAuthPage ? [] : (menuConfigs[role] || []);

    // 4. Secret Exit Trigger (Kiosk Mode ONLY)
    const handleLogoDoubleClick = () => {
        if (isKiosk) {
            navigate('/exit-public-auth');
        }
    };

    // 5. Navigation Logic (Removed annoying alerts)
    const handleNavigation = (item) => {
        if (isPublic && item === 'Menu') {
            navigate('/customer-website');
            return;
        }

        const routeMap = {
            'Employees': role === 'Admin' ? '/admin-panel' : '/manager-employees',
            'Inventory': '/inventory',
            'Menu': '/menu-management',
            'Profile': '/admin-profile',
            'Dashboard': role === 'Manager' ? '/manager-dashboard' : '/staff-dashboard',
        };

        if (routeMap[item]) navigate(routeMap[item]);
    };

    // 6. Logout / Sign In logic
    const handleRightBtn = () => {
        if (isKiosk) {
            alert("Proceeding to Checkout...");
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

    // 7. INTERNAL STYLES (Fixed the 'topBarStyles' error)
    const topBarStyles = {
        container: { 
            position: 'fixed', top: 0, left: 0, right: 0, height: '70px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '0 30px', color: 'white', zIndex: 1000, 
            backgroundColor: res.accent_color, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontFamily: 'Verdana'
        },
        leftSection: { display: 'flex', alignItems: 'center', gap: '15px', flex: '0 0 250px' },
        middleSection: { display: 'flex', justifyContent: 'center', flex: 1, gap: '2px' },
        rightSection: { display: 'flex', justifyContent: 'flex-end', flex: '0 0 250px' },
        logo: { 
            width: '42px', height: '42px', borderRadius: '50%', 
            backgroundColor: 'white', objectFit: 'cover', border: '2px solid white',
            cursor: isKiosk ? 'pointer' : 'default' 
        },
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
            fontFamily: 'Verdana',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }
    };

    return (
        <div style={topBarStyles.container}>
            {/* LEFT: Logo & Name */}
            <div style={topBarStyles.leftSection}>
                <img 
                    src={`http://localhost:8000/storage/${res.logo}`} 
                    style={topBarStyles.logo} 
                    alt="Logo" 
                    onDoubleClick={handleLogoDoubleClick}
                    title={isKiosk ? "Double-click for Admin Exit" : ""}
                    onError={e => e.target.src="https://via.placeholder.com/40"} 
                />
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{res.restaurant_name}</span>
            </div>

            {/* MIDDLE: Centered Navigation Buttons */}
            <div style={topBarStyles.middleSection}>
                {!isAuthPage && menuItems.map(item => (
                    <button 
                        key={item} 
                        style={topBarStyles.navBtn(hoveredBtn === item)}
                        onMouseEnter={() => setHoveredBtn(item)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        onClick={() => handleNavigation(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* RIGHT: White Capsule Button */}
            <div style={topBarStyles.rightSection}>
                <button style={topBarStyles.capsuleBtn} onClick={handleRightBtn}>
                    {isKiosk ? "Checkout" : (isPublic ? (customer ? "Sign Out" : "Sign In") : "Log Out")}
                </button>
            </div>
        </div>
    );
};

export default TopBar;