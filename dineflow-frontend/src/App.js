import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Styles
import { styles } from './styles/theme';

// Import Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminAuth from './pages/Auth/AdminAuth';
import EmployeeAuth from './pages/Auth/EmployeeAuth';
import ExitPublicAuth from './pages/Auth/ExitPublicAuth';
import CustomerAuth from './pages/Auth/CustomerAuth';

import Dashboard from './pages/Dashboards/Dashboard';
import ManagerDashboard from './pages/Dashboards/ManagerDashboard'; // Imported ONCE
import StaffDashboard from './pages/Dashboards/StaffDashboard';     // Imported ONCE

import EmployeeDirectory from './pages/EmployeeDirectory';
import AdminProfile from './pages/AdminProfile';
import Inventory from './pages/Inventory';
import RoleSelection from './pages/RoleSelection';
import KioskMode from './pages/KioskMode';
import CustomerWebsite from './pages/CustomerWebsite';
import MenuManagement from './pages/MenuManagement';
import Checkout from './pages/Checkout';
import PurchaseHistory from './pages/PurchaseHistory';
import ReviewPage from './pages/ReviewPage';

function App() {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};

    return (
        <Router>
            <div style={styles.app}>
                <Routes>
                    {/* 1. RESTAURANT OWNER & GENERAL AUTH */}
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin-profile" element={<AdminProfile />} />

                    {/* 2. EMPLOYEE SYSTEM (WHO ARE YOU?) */}
                    <Route path="/employee-view" element={<RoleSelection />} />
                    
                    {/* 3. ADMIN WORKSPACE */}
                    <Route path="/admin-auth" element={<AdminAuth />} />
                    <Route path="/admin-panel" element={<EmployeeDirectory role="Admin" />} />

                    {/* 4. MANAGER WORKSPACE */}
                    <Route path="/manager-auth" element={<EmployeeAuth type="Manager" />} />
                    <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                    <Route path="/manager-employees" element={<EmployeeDirectory role="Manager" />} />

                    {/* 5. STAFF WORKSPACE */}
                    <Route path="/staff-auth" element={<EmployeeAuth type="Staff" />} />
                    <Route path="/staff-dashboard" element={<StaffDashboard />} />

                    {/* 6. KIOSK & CUSTOMER WEBSITE */}
                    <Route path="/kiosk" element={<KioskMode />} />
                    <Route path="/exit-public-auth" element={<ExitPublicAuth />} />
                    <Route path="/customer-website" element={<CustomerWebsite />} /> 
                    <Route path="/customer-auth" element={<CustomerAuth />} />
                    <Route path="/publicview" element={<CustomerWebsite />} />

                    {/* 7. SHARED MODULES */}
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/menu-management" element={<MenuManagement role={res.position ? (res.position.toLowerCase() === 'manager' ? 'Manager' : 'Staff') : 'Admin'} />} />
                    <Route path="/checkout-kiosk" element={<Checkout mode="kiosk" />} />
                    <Route path="/checkout-public" element={<Checkout mode="website" />} />
                    <Route path="/purchase-history" element={<PurchaseHistory />} />
                    <Route path="/reviews" element={<ReviewPage />} />

                    <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                    <Route path="/staff-dashboard" element={<StaffDashboard />} />
                    
                </Routes>
            </div>
        </Router>
    );
}

export default App;