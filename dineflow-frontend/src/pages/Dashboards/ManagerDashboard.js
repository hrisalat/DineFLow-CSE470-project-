import React from 'react';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const ManagerDashboard = () => (
    <div style={styles.app}>
        <TopBar role="Manager" menuItems={['Dashboard', 'Employee', 'Menu', 'Inventory', 'Finances']} />
        <div style={styles.container}><h1>Manager Workspace</h1></div>
    </div>
);
export default ManagerDashboard;