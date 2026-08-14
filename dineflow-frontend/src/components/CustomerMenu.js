import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CustomerMenu = () => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || { accent_color: '#6366f1' };
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('default'); 
    const [selectedOptions, setSelectedOptions] = useState({}); 
    const [quantities, setQuantities] = useState({}); 

    const fetchMenu = useCallback(async () => {
        if (!res.id) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/menu/${res.id}`);
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (err) { console.error("Menu fetch failed"); }
    }, [res.id]);

    useEffect(() => { fetchMenu(); }, [fetchMenu]);

    const safeParse = (data) => {
        if (!data) return [];
        if (typeof data === 'object') return data;
        try { return JSON.parse(data); } catch (e) { return []; }
    };

    const getMinPrice = (item) => {
        if (item.price_type === 'fixed') return parseFloat(item.price);
        const options = safeParse(item.price_options);
        if (options.length === 0) return 0;
        return Math.min(...options.map(opt => parseFloat(opt.price)));
    };

    return (
        <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Verdana' }}>
            
            {/* SEARCH & PRICE FILTER BAR */}
            <div style={filterBarContainer}>
                <input 
                    type="text" 
                    placeholder="Search for dishes..." 
                    style={searchInput} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    style={sortSelect} 
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="default">Sort by Price</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                </select>
            </div>

            {categories.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>Loading menu...</p>
            ) : (
                categories.map(cat => {
                    const filteredItems = (cat.items || [])
                        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .sort((a, b) => {
                            if (sortOrder === 'low') return getMinPrice(a) - getMinPrice(b);
                            if (sortOrder === 'high') return getMinPrice(b) - getMinPrice(a);
                            return 0;
                        });

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={cat.id} style={{ marginBottom: '50px' }}>
                            <h2 style={{ borderLeft: `6px solid ${res.accent_color}`, paddingLeft: '15px', textTransform: 'uppercase', fontSize: '20px' }}>
                                {cat.name}
                            </h2>
                            
                            {/* FIXED: Changed justifyContent from 'center' to 'flex-start' */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'flex-start', marginTop: '20px' }}>
                                {filteredItems.map(item => {
                                    const isGrid = !!item.image;
                                    const currentStyle = isGrid ? cardStyle : listRowStyle;

                                    return (
                                        <div key={item.id} style={currentStyle}>
                                            {item.image && <img src={`http://localhost:8000/storage/${item.image}`} style={imgStyle} alt={item.name} />}
                                            
                                            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <strong style={{ fontSize: '17px' }}>{item.name}</strong>
                                                    {item.tag && <span style={{ ...tagStyle, backgroundColor: res.accent_color }}>{item.tag}</span>}
                                                </div>
                                                <p style={{ fontSize: '11px', color: '#777', margin: '10px 0' }}>{item.description}</p>
                                                
                                                <div style={{ marginTop: 'auto' }}>
                                                    {item.price_type === 'fixed' ? (
                                                        <div style={{ marginBottom: '10px' }}>
                                                            <span style={{ fontWeight: 'bold', color: res.accent_color, fontSize: '18px' }}>৳{item.price}</span>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                                                            {safeParse(item.price_options).map((opt, idx) => {
                                                                const isSelected = selectedOptions[item.id] === idx;
                                                                return (
                                                                    <div 
                                                                        key={idx} 
                                                                        onClick={() => setSelectedOptions({...selectedOptions, [item.id]: isSelected ? null : idx})}
                                                                        style={{
                                                                            ...variationBadge,
                                                                            backgroundColor: isSelected ? res.accent_color : 'white',
                                                                            color: isSelected ? 'white' : '#333',
                                                                            borderColor: isSelected ? res.accent_color : '#ddd'
                                                                        }}
                                                                    >
                                                                        {opt.qty}: ৳{opt.price}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#999' }}>QTY:</span>
                                                        <input 
                                                            type="number" 
                                                            min="1"
                                                            style={qtyInput} 
                                                            value={quantities[item.id] || ''}
                                                            onChange={(e) => setQuantities({...quantities, [item.id]: e.target.value})}
                                                        />
                                                    </div>

                                                    <button style={{ ...addToCartBtn, backgroundColor: res.accent_color }}>
                                                        ADD TO CART
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

const filterBarContainer = { display: 'flex', gap: '15px', marginBottom: '40px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' };
const searchInput = { flex: 3, padding: '12px', borderRadius: '8px', border: '1px solid #eee', fontFamily: 'Verdana', fontSize: '14px' };
const sortSelect = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #eee', fontFamily: 'Verdana', fontSize: '14px', cursor: 'pointer' };
const cardStyle = { width: '255px', background: '#fff', borderRadius: '15px', boxShadow: '0 6px 15px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const listRowStyle = { width: '100%', background: '#fff', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', border: '1px solid #eee', marginBottom: '10px' };
const imgStyle = { width: '100%', height: '160px', objectFit: 'cover' };
const tagStyle = { color: 'white', fontSize: '8px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' };
const variationBadge = { fontSize: '10px', padding: '6px 10px', borderRadius: '50px', border: '1px solid #ddd', cursor: 'pointer', transition: '0.2s', fontWeight: 'bold' };
const qtyInput = { width: '50px', padding: '6px', borderRadius: '6px', border: '1px solid #eee', textAlign: 'center', fontSize: '13px' };
const addToCartBtn = { width: '100%', color: 'white', border: 'none', padding: '10px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px', fontSize: '11px' };

export default CustomerMenu;