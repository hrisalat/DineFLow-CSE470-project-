import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminAuth from './pages/Auth/AdminAuth';
import EmployeeAuth from './pages/Auth/EmployeeAuth';
import Dashboard from './pages/Dashboards/Dashboard';
import ManagerDashboard from './pages/Dashboards/ManagerDashboard';
import StaffDashboard from './pages/Dashboards/StaffDashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import RoleSelection from './pages/RoleSelection';
import { styles } from './styles/theme';
import AdminProfile from './pages/AdminProfile';
import PublicView from './pages/PublicView';
import CustomerAuth from './pages/Auth/CustomerAuth';
import ExitPublicAuth from './pages/Auth/ExitPublicAuth';
import Inventory from './pages/Inventory';

function App() {
    // FIX: Define 'res' before the return statement so it's available for the routes below
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    
    return (
        <Router>
            <div style={styles.app}>
                <Routes>
                    {/* --- MAIN AUTH & RESTAURANT PROFILE --- */}
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin-profile" element={<AdminProfile />} />

                    {/* --- PUBLIC / CUSTOMER VIEW --- */}
                    <Route path="/public-view" element={<PublicView />} />
                    <Route path="/customer-auth" element={<CustomerAuth />} />
                    <Route path="/exit-public-auth" element={<ExitPublicAuth />} />

                    {/* --- ROLE SELECTION (WHO ARE YOU?) --- */}
                    <Route path="/employee-view" element={<RoleSelection />} />

                    {/* --- ADMIN WORKSPACE --- */}
                    <Route path="/admin-auth" element={<AdminAuth />} />
                    <Route path="/admin-panel" element={<EmployeeDirectory role="Admin" />} />

                    {/* --- MANAGER WORKSPACE --- */}
                    <Route path="/manager-auth" element={<EmployeeAuth type="Manager" />} />
                    <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                    <Route path="/manager-employees" element={<EmployeeDirectory role="Manager" />} />

                    {/* --- STAFF WORKSPACE --- */}
                    <Route path="/staff-auth" element={<EmployeeAuth type="Staff" />} />
                    <Route path="/staff-dashboard" element={<StaffDashboard />} />

                    <Route path="/inventory" element={<Inventory />} />
                    
                </Routes>
            </div>
        </Router>
    );
}

export default App;