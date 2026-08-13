import React from 'react';
import TopBar from '../../components/TopBar';
import { styles } from '../../styles/theme';

const StaffDashboard = () => (
    <div style={styles.app}>
        <TopBar role="Staff" menuItems={['Dashboard', 'Menu', 'Inventory', 'Order Progress']} />
        <div style={styles.container}><h1>Staff Workspace</h1></div>
    </div>
);
export default StaffDashboard;