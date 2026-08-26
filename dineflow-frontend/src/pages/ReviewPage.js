import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const ReviewPage = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    const customer = JSON.parse(localStorage.getItem('customer')) || {};
    console.log("Current Logged In Customer:", customer);
    // States for data
    const [menuItems, setMenuItems] = useState([]);
    const [itemReviews, setItemReviews] = useState([]); // Reviews for a specific item
    
    // States for UI
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('All');
    const [showRateModal, setShowRateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false); // Fixed Naming
    const [selectedItem, setSelectedItem] = useState(null);

    // Form State for new review
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    // 1. Fetch Menu (to get items and their average ratings)
    const fetchMenu = useCallback(async () => {
        if (!res.id) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/menu/${res.id}`);
            // Flatten categories to get all items in one list
            const allItems = response.data.flatMap(cat => cat.items || []);
            setMenuItems(allItems);
        } catch (err) {
            console.error("Failed to fetch menu items for reviews");
        }
    }, [res.id]);

    useEffect(() => {
        if (!customer.phone) {
            navigate('/customer-auth');
        } else {
            fetchMenu();
        }
    }, [fetchMenu, customer.phone, navigate]);

    // 2. Open Modal to see what others said about a specific item
    const openViewReviews = async (item) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/item-reviews/${item.id}`);
            setItemReviews(response.data);
            setSelectedItem(item);
            setShowViewModal(true);
        } catch (err) {
            alert("Could not load reviews for this item.");
        }
    };

    // 3. Submit a new rating
    const handleRateSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Get the data again right at the moment of clicking
    const activeCustomer = JSON.parse(localStorage.getItem('customer'));

    if (!activeCustomer || !activeCustomer.id) {
        alert("Session Error: Your User ID was not found. Please Sign Out and Sign In again to refresh your profile.");
        return;
    }

    try {
        await axios.post('http://localhost:8000/api/reviews', {
            user_id: activeCustomer.id, // Use the ID we just grabbed
            restaurant_id: res.id,
            menu_item_id: selectedItem.id,
            rating: rating,
            comment: comment
        });
        
        setShowRateModal(false);
        setComment('');
        alert("Review posted!");
        fetchMenu(); // Refresh stars
    } catch (err) {
        alert("Error: " + (err.response?.data?.message || "Check your connection"));
    }
};


    // 4. Filter and Search Logic
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        // Simple filter: match the integer part of the average rating
        const avg = Math.floor(item.average_rating || 0);
        const matchesFilter = filterRating === 'All' || avg === parseInt(filterRating);
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={styles.app}>
            <TopBar role="Public" />
            
            <div style={{ ...styles.container, padding: '100px 20px' }}>
                <h1 style={{ fontFamily: 'Verdana', color: res.accent_color, textAlign: 'center' }}>Rate Our Menu</h1>

                {/* SEARCH & FILTER BAR */}
                <div style={filterBarContainer}>
                    <input 
                        style={{ ...styles.input, flex: 3, margin: 0 }} 
                        placeholder="Search for a dish (e.g. Pizza)..." 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                    <select 
                        style={{ ...styles.input, flex: 1, margin: 0 }} 
                        value={filterRating}
                        onChange={e => setFilterRating(e.target.value)}
                    >
                        <option value="All">All Ratings</option>
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                </div>

                {/* ITEM LIST */}
                <div style={{ width: '100%', maxWidth: '850px' }}>
                    {filteredItems.map(item => (
                        <div key={item.id} style={itemRow}>
                            <div style={{ flex: 1 }}>
                                <strong style={{ fontSize: '19px' }}>{item.name}</strong>
                                
                                {/* AVERAGE STARS (Clickable to view reviews) */}
                                <div onClick={() => openViewReviews(item)} style={{ cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ color: '#f1c40f', fontSize: '20px' }}>
                                        {'★'.repeat(Math.floor(item.average_rating || 0))}
                                        {'☆'.repeat(5 - Math.floor(item.average_rating || 0))}
                                    </span>
                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#888' }}>
                                        ({item.average_rating || 0} average)
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={() => { setSelectedItem(item); setShowRateModal(true); }} 
                                style={{ ...styles.button, width: 'auto', padding: '12px 30px', backgroundColor: res.accent_color, borderRadius: '50px' }}
                            >
                                RATE THIS
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL 1: SUBMIT RATING FORM */}
            {showRateModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleRateSubmit}>
                        <h2 style={{ marginTop: 0 }}>Rate {selectedItem?.name}</h2>
                        
                        <label style={lblStyle}>Select Stars</label>
                        <select style={styles.input} value={rating} onChange={e => setRating(parseInt(e.target.value))}>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                        </select>

                        <label style={lblStyle}>Comment (Optional)</label>
                        <textarea 
                            style={{ ...styles.input, height: '100px', resize: 'none' }} 
                            placeholder="Tell us what you liked or disliked..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />

                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, borderRadius: '50px' }}>SUBMIT RATING</button>
                        <button type="button" onClick={() => setShowRateModal(false)} style={{ ...styles.button, background: '#444', borderRadius: '50px', marginTop: '8px' }}>CANCEL</button>
                    </form>
                </div>
            )}

            {/* MODAL 2: VIEW ALL REVIEWS FOR THIS ITEM */}
            {showViewModal && (
                <div style={modalOverlay}>
                    <div style={{ ...styles.wideCard, maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Reviews for {selectedItem?.name}</h2>
                            <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>

                        {itemReviews.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No written reviews yet. Be the first!</p>
                        ) : (
                            itemReviews.map(rev => (
                                <div key={rev.id} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f4f4f4' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{rev.user?.name || "Customer"}</strong>
                                        <span style={{ color: '#f1c40f' }}>{'★'.repeat(rev.rating)}</span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#444', marginTop: '8px', fontStyle: rev.comment ? 'normal' : 'italic' }}>
                                        {rev.comment || ""}
                                    </p>
                                    <small style={{ color: '#bbb', fontSize: '10px' }}>{new Date(rev.created_at).toLocaleDateString()}</small>
                                </div>
                            ))
                        )}
                        
                        <button onClick={() => setShowViewModal(false)} style={{ ...styles.button, background: '#333', borderRadius: '50px' }}>CLOSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const filterBarContainer = { display: 'flex', gap: '15px', width: '100%', maxWidth: '850px', marginBottom: '30px', background: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' };
const itemRow = { background: 'white', padding: '25px', borderRadius: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const lblStyle = { fontSize: '11px', fontWeight: 'bold', display: 'block', marginTop: '15px', textTransform: 'uppercase', color: '#888' };

export default ReviewPage;