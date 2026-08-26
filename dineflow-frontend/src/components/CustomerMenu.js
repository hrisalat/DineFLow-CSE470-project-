import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerMenu = () => {
    const navigate = useNavigate();
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    const customer = JSON.parse(localStorage.getItem('customer')); 

    const [categories, setCategories] = useState([]);
    const [inventory, setInventory] = useState([]); 
    const [previousItems, setPreviousItems] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('default'); 
    
    const [selectedOptions, setSelectedOptions] = useState({}); 
    const [quantities, setQuantities] = useState({}); 
    const [customInstructions, setCustomInstructions] = useState({}); 

    const fetchData = useCallback(async () => {
        if (!res.id) return;
        try {
            const menuRes = await axios.get(`http://localhost:8000/api/menu/${res.id}`);
            setCategories(Array.isArray(menuRes.data) ? menuRes.data : []);
            
            const invRes = await axios.get(`http://localhost:8000/api/inventory/${res.id}`);
            setInventory(Array.isArray(invRes.data) ? invRes.data : []);

            if (customer && customer.phone) {
                const prevRes = await axios.get(`http://localhost:8000/api/customer/previous-items/${customer.phone}`);
                setPreviousItems(Array.isArray(prevRes.data) ? prevRes.data : []);
            }
        } catch (err) { console.error("Data fetch failed", err); }
    }, [res.id, customer?.phone]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- LOGIC: EXTRACT POPULAR ITEMS (Rating >= 4) ---
    const allItems = categories.flatMap(cat => cat.items || []);
    const popularItems = allItems.filter(item => parseFloat(item.average_rating || 0) >= 4);

    const checkAvailability = (item) => {
        const itemIngredients = item.ingredients || [];
        if (itemIngredients.length === 0) return true;
        for (let ing of itemIngredients) {
            const stockItem = inventory.find(inv => inv.id === ing.inventory_id);
            if (!stockItem || parseFloat(stockItem.quantity) < parseFloat(ing.quantity_needed)) return false;
        }
        return true;
    };

    const safeParse = (data) => {
        if (!data) return [];
        if (typeof data === 'object') return data;
        try { return JSON.parse(data); } catch (e) { return []; }
    };

    const getMinPrice = (item) => {
        if (item.price_type === 'fixed') return parseFloat(item.price);
        const options = safeParse(item.price_options);
        return options.length === 0 ? 0 : Math.min(...options.map(opt => parseFloat(opt.price)));
    };

    const handleAddToCart = (item) => {
        const qty = parseInt(quantities[item.id] || 1);
        const selectedVariantIndex = selectedOptions[item.id];
        let price = item.price;
        let variantName = "Standard";

        if (item.price_type === 'quantity') {
            if (selectedVariantIndex === undefined || selectedVariantIndex === null) {
                alert("Please select a size/option first!");
                return;
            }
            const options = safeParse(item.price_options);
            price = options[selectedVariantIndex].price;
            variantName = options[selectedVariantIndex].qty;
        }

        const cartItem = {
            cartId: Date.now(),
            id: item.id,
            name: item.name,
            quantity: qty,
            price: price,
            variant: variantName,
            note: customInstructions[item.id] || ""
        };

        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        localStorage.setItem('cart', JSON.stringify([...currentCart, cartItem]));
        alert(`Added ${qty} x ${item.name} to cart!`);
        window.location.reload(); 
    };

    return (
        <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Verdana' }}>
            
            {/* Filter Bar */}
            <div style={filterBarContainer}>
                <input type="text" placeholder="Search for dishes..." style={searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
                <select style={sortSelect} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="default">Sort by Price</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                </select>
            </div>

            {/* --- SECTION 1: FROM YOUR PREVIOUS PURCHASE --- */}
            {customer && previousItems.length > 0 && (
                <div style={horizontalSectionContainer}>
                    <h2 style={{ fontSize: '14px', color: '#444', marginBottom: '15px', fontWeight: 'bold' }}>
                        FROM YOUR PREVIOUS PURCHASE
                    </h2>
                    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {previousItems.map(item => (
                            <div key={item.id} style={horizontalItemCard}>
                                <img src={`http://localhost:8000/storage/${item.image}`} style={horizontalImg} alt={item.name} onError={e => e.target.src="https://via.placeholder.com/100"} />
                                <p style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '8px', color: '#555' }}>{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- SECTION 2: POPULAR ITEMS (Rating >= 4) --- */}
            {popularItems.length > 0 && (
                <div style={horizontalSectionContainer}>
                    <h2 style={{ fontSize: '22px', color: '#444', marginBottom: '15px', fontWeight: 'bold' }}>
                        🔥 POPULAR ITEMS
                    </h2>
                    <div style={{ display: 'flex', gap: '0px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {popularItems.map(item => (
                            <div key={item.id} style={horizontalItemCard}>
                                <img src={`http://localhost:8000/storage/${item.image}`} style={{...horizontalImg, borderColor: '#f1c40f'}} alt={item.name} onError={e => e.target.src="https://via.placeholder.com/100"} />
                                <p style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '8px', color: '#555' }}>{item.name}</p>
                                
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- SECTION 3: FULL MENU --- */}
            {categories.map(cat => {
                const filteredItems = (cat.items || [])
                    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a, b) => sortOrder === 'low' ? getMinPrice(a) - getMinPrice(b) : sortOrder === 'high' ? getMinPrice(b) - getMinPrice(a) : 0);

                if (filteredItems.length === 0) return null;

                return (
                    <div key={cat.id} style={{ marginBottom: '50px' }}>
                        <h2 style={{ borderLeft: `6px solid ${res.accent_color}`, paddingLeft: '15px', textTransform: 'uppercase', fontSize: '20px' }}>{cat.name}</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'flex-start', marginTop: '20px' }}>
                            {filteredItems.map(item => {
                                const isGrid = !!item.image;
                                const itemTags = safeParse(item.tags);
                                const isCustomizable = itemTags.includes('Customizable');
                                const isAvailable = checkAvailability(item);

                                return (
                                    <div key={item.id} style={{ ... (isGrid ? cardStyle : listRowStyle), opacity: isAvailable ? 1 : 0.6 }}>
                                        {item.image && <img src={`http://localhost:8000/storage/${item.image}`} style={imgStyle} alt={item.name} />}
                                        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                                            <strong style={{ fontSize: '17px' }}>{item.name}</strong>
                                            
                                            {/* Tags under Name */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '8px 0' }}>
                                                {itemTags.map((tag, idx) => (
                                                    <span key={idx} style={{ ...tagStyle, backgroundColor: res.accent_color }}>{tag}</span>
                                                ))}
                                            </div>

                                            <p style={{ fontSize: '11px', color: '#777', margin: '0 0 15px 0' }}>{item.description}</p>
                                            
                                            <div style={{ marginTop: 'auto' }}>
                                                {item.price_type === 'fixed' ? (
                                                    <div style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold', color: res.accent_color, fontSize: '18px' }}>৳{item.price}</span></div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                                                        {safeParse(item.price_options).map((opt, idx) => (
                                                            <div key={idx} onClick={() => isAvailable && setSelectedOptions({...selectedOptions, [item.id]: selectedOptions[item.id] === idx ? null : idx})} style={{ ...variationBadge, backgroundColor: selectedOptions[item.id] === idx ? res.accent_color : 'white', color: selectedOptions[item.id] === idx ? 'white' : '#333', borderColor: selectedOptions[item.id] === idx ? res.accent_color : '#ddd', cursor: isAvailable ? 'pointer' : 'not-allowed' }}>{opt.qty}: ৳{opt.price}</div>
                                                        ))}
                                                    </div>
                                                )}

                                                {isCustomizable && isAvailable && (
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', display: 'block' }}>CUSTOMIZABLE</label>
                                                        <textarea placeholder="Instructions..." style={customTextArea} value={customInstructions[item.id] || ''} onChange={(e) => setCustomInstructions({...customInstructions, [item.id]: e.target.value})} />
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#999' }}>QTY:</span>
                                                    <input type="number" min="1" style={qtyInput} value={quantities[item.id] || ''} placeholder="1" disabled={!isAvailable} onChange={(e) => setQuantities({...quantities, [item.id]: e.target.value})} />
                                                </div>

                                                <button onClick={() => isAvailable ? handleAddToCart(item) : alert("Not available in stock")} style={{ ...addToCartBtn, backgroundColor: isAvailable ? res.accent_color : '#888', cursor: isAvailable ? 'pointer' : 'not-allowed' }}>{isAvailable ? "ADD TO CART" : "NOT AVAILABLE"}</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- STYLES ---
const horizontalSectionContainer = { background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' };
const horizontalItemCard = { textAlign: 'center', minWidth: '130px', padding: '10px', borderRadius: '12px' };
const horizontalImg = { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: `3px solid #eee` };

const filterBarContainer = { display: 'flex', gap: '15px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' };
const searchInput = { flex: 3, padding: '12px', borderRadius: '8px', border: '1px solid #eee', fontFamily: 'Verdana', fontSize: '14px' };
const sortSelect = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #eee', fontFamily: 'Verdana', fontSize: '14px' };
const cardStyle = { width: '255px', background: '#fff', borderRadius: '15px', boxShadow: '0 6px 15px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const listRowStyle = { width: '100%', background: '#fff', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', border: '1px solid #eee', marginBottom: '10px' };
const imgStyle = { width: '100%', height: '160px', objectFit: 'cover' };
const tagStyle = { color: 'white', fontSize: '8px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' };
const variationBadge = { fontSize: '10px', padding: '6px 10px', borderRadius: '50px', border: '1px solid #ddd', cursor: 'pointer', transition: '0.2s', fontWeight: 'bold' };
const qtyInput = { width: '50px', padding: '6px', borderRadius: '6px', border: '1px solid #eee', textAlign: 'center', fontSize: '13px', fontFamily: 'Verdana' };
const customTextArea = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', fontSize: '12px', fontFamily: 'Verdana', boxSizing: 'border-box', resize: 'none', height: '60px' };
const addToCartBtn = { width: '100%', color: 'white', border: 'none', padding: '10px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px', fontSize: '11px', transition: '0.3s' };

export default CustomerMenu;