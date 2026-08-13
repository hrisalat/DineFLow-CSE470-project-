import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

export const Dashboard = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    return (
        <div style={{ fontFamily: 'Verdana' }}>
            <TopBar role="Owner" menuItems={[]} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '150px' }}>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <div style={{ background: res.accent_color, color: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', width: '200px' }} onClick={() => alert("Public View")}>
                        <h2>Public View</h2>
                    </div>
                    <div style={{ background: res.accent_color, color: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', width: '200px' }} onClick={() => navigate('/employee-view')}>
                        <h2>Employee View</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ManagerDashboard = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    return (
        <div style={{ fontFamily: 'Verdana' }}>
            <TopBar role="Manager" menuItems={['Dashboard', 'Employee', 'Menu', 'Inventory', 'Finances']} />
            <div style={{ paddingTop: '150px', textAlign: 'center', color: res.accent_color }}>
                <h1>Manager Workspace</h1>
            </div>
        </div>
    );
};

export const StaffDashboard = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    return (
        <div style={{ fontFamily: 'Verdana' }}>
            <TopBar role="Staff" menuItems={['Dashboard', 'Menu', 'Inventory', 'Order Progress']} />
            <div style={{ paddingTop: '150px', textAlign: 'center', color: res.accent_color }}>
                <h1>Staff Workspace</h1>
            </div>
        </div>
    );
};