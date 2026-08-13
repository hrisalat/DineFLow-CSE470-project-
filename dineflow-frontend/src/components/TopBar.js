import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TopBar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredBtn, setHoveredBtn] = useState(null);

    // 1. Get Restaurant and Customer data from storage
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1', restaurant_name: 'DineFlow' };
    const customer = JSON.parse(localStorage.getItem('customer'));

    // 2. Define Menu Layouts based on Role
    const menuConfigs = {
        Admin: ['Employees', 'Inventory', 'Menu', 'Coupons', 'Reservations', 'Waste Management', 'Finances', 'Profile'],
        Manager: ['Dashboard', 'Employees', 'Inventory', 'Menu', 'Coupons', 'Reservations', 'Waste Management', 'Finances'],
        Staff: ['Dashboard', 'Take Order', 'Menu', 'Inventory', 'Order Progress', 'Reservations', 'Waste Management', 'Finances'],
        Public: customer ? ['Menu', 'Review', 'Purchase History', 'Profile'] : ['Menu', 'Cart']
    };

    // 3. Logic to hide buttons during Login/Signup
    const isAuthPage = location.pathname.includes('auth') || location.pathname === '/' || location.pathname === '/register';
    const isPublic = role === "Public";
    const menuItems = isAuthPage ? [] : (menuConfigs[role] || []);

    // 4. Logout / Sign In logic
    const handleRightBtn = () => {
        if (isPublic) {
            if (customer) {
                localStorage.removeItem('customer');
                window.location.reload();
            } else {
                navigate('/customer-auth');
            }
        } else {
            const path = location.pathname;
            const isSubProfile = path.includes('panel') || path.includes('employees') || path.includes('dashboard') || path.includes('auth') || path.includes('profile');
            if (isSubProfile && path !== '/dashboard') {
                navigate('/employee-view');
            } else {
                localStorage.clear();
                navigate('/');
            }
        }
    };

    // 5. Navigation logic (Centered Buttons)
    const handleNavigation = (item) => {
        if (isPublic && item === 'Menu') return navigate('/public-view');
        
        const routeMap = {
            'Employees': role === 'Admin' ? '/admin-panel' : '/manager-employees',
            'Inventory': '/inventory',
            'Profile': '/admin-profile',
            'Dashboard': role === 'Manager' ? '/manager-dashboard' : '/staff-dashboard',
        };

        if (routeMap[item]) navigate(routeMap[item]);
    };

    // 6. Internal Styles
    const styles = {
        topBar: { 
            position: 'fixed', top: 0, left: 0, right: 0, height: '70px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '0 30px', color: 'white', zIndex: 1000, 
            backgroundColor: res.accent_color, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontFamily: 'Verdana'
        },
        leftSection: { display: 'flex', alignItems: 'center', gap: '15px', flex: '0 0 250px' },
        middleSection: { display: 'flex', justifyContent: 'center', flex: 1, gap: '2px' },
        rightSection: { display: 'flex', justifyContent: 'flex-end', flex: '0 0 250px' },
        logo: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', objectFit: 'cover', cursor: isPublic ? 'pointer' : 'default' },
        navBtn: (isHovered) => ({
            background: isHovered ? 'rgba(255,255,255,0.25)' : 'none',
            border: 'none', color: 'white', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '9px', padding: '10px 10px',
            borderRadius: '4px', textTransform: 'uppercase', transition: '0.2s'
        }),
        capsuleBtn: {
            backgroundColor: 'white',
            color: res.accent_color,
            border: 'none',
            padding: '10px 20px',
            borderRadius: '50px', // CAPSULE SHAPE
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '11px',
            textTransform: 'uppercase',
            fontFamily: 'Verdana'
        }
    };

    return (
        <div style={styles.topBar}>
            {/* LEFT: Logo & Name */}
            <div style={styles.leftSection}>
                <img 
                    src={`http://localhost:8000/storage/${res.logo}`} 
                    style={styles.logo} 
                    alt="L" 
                    onDoubleClick={() => isPublic && navigate('/exit-public-auth')}
                    onError={e => e.target.src="https://via.placeholder.com/40"} 
                />
                <span style={{ fontWeight: 'bold' }}>{res.restaurant_name}</span>
            </div>

            {/* MIDDLE: Centered Role Buttons */}
            <div style={styles.middleSection}>
                {menuItems.map(item => (
                    <button 
                        key={item} 
                        style={styles.navBtn(hoveredBtn === item)}
                        onMouseEnter={() => setHoveredBtn(item)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        onClick={() => handleNavigation(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* RIGHT: White Capsule Logout/Login */}
            <div style={styles.rightSection}>
                <button style={styles.capsuleBtn} onClick={handleRightBtn}>
                    {isPublic ? (customer ? "Sign Out" : "Sign In") : "Log Out"}
                </button>
            </div>
        </div>
    );
};

export default TopBar;