// src/styles/theme.js
export const styles = {
    app: { fontFamily: 'Verdana, Geneva, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', color: '#333' },
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '100px', paddingBottom: '50px' },
    authContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' },
    card: { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' },
    wideCard: { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '95%', maxWidth: '1000px' },
    input: { width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'Verdana' },
    button: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontFamily: 'Verdana' },
    topBar: { position: 'fixed', top: 0, left: 0, right: 0, height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', color: 'white', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    navBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', marginLeft: '12px', fontFamily: 'Verdana', textTransform: 'uppercase' },
    floatingBtn: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', color: 'white', fontSize: '30px', border: 'none', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 },
    empCard: { display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee', gap: '20px' },
    avatar: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' },
    idBadge: { padding: '5px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: 'white' },
    deleteBtn: { backgroundColor: '#ff4d4d', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginLeft: '15px' }
};