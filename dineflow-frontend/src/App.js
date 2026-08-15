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
import ManagerDashboard from './pages/Dashboards/ManagerDashboard';
import StaffDashboard from './pages/Dashboards/StaffDashboard';

import EmployeeDirectory from './pages/EmployeeDirectory';
import AdminProfile from './pages/AdminProfile';
import Inventory from './pages/Inventory';
import RoleSelection from './pages/RoleSelection';
import KioskMode from './pages/KioskMode';
import CustomerWebsite from './pages/CustomerWebsite';
import MenuManagement from './pages/MenuManagement';
import Checkout from './pages/Checkout';

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

                     {/* 1. THE KIOSK (Tablet inside the restaurant) */}
                        <Route path="/kiosk" element={<KioskMode />} />
                        <Route path="/exit-public-auth" element={<ExitPublicAuth />} />

                        {/* 2. THE CUSTOMER WEBSITE (Accessible from anywhere) */}
                        {/* I renamed this to customer-website as requested earlier */}
                        <Route path="/customer-website" element={<CustomerWebsite />} /> 
                        <Route path="/customer-auth" element={<CustomerAuth />} />

                        {/* If you specifically want the URL to be /publicview, add this line: */}
                        <Route path="/publicview" element={<CustomerWebsite />} />

                    {/* 8. SHARED TOOLS */}
                    <Route path="/inventory" element={<Inventory />} />
              
                <Route path="/menu-management" element={<MenuManagement role={res.position ? (res.position.toLowerCase() === 'manager' ? 'Manager' : 'Staff') : 'Admin'} />} />
                
                                    // Management/Kiosk route
                    <Route path="/checkout-kiosk" element={<Checkout mode="kiosk" />} />

                    // Website route
                    <Route path="/checkout-public" element={<Checkout mode="website" />} />
                  </Routes>

            </div>
        </Router>
    );
}

export default App;