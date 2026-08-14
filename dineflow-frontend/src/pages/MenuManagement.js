import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { styles } from '../styles/theme';

const MenuManagement = ({ role }) => {
    const res = JSON.parse(localStorage.getItem('restaurant')) || {};
    const [categories, setCategories] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);

    // Form States
    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const emptyItem = { name: '', description: '', price: '', tag: '', price_type: '', image: null };
    const [itemForm, setItemForm] = useState(emptyItem);
    const [priceOptions, setPriceOptions] = useState([{ qty: '', price: '' }]);
    const [ingredients, setIngredients] = useState([{ inventory_id: '', quantity: '' }]);

    // Trackers for Editing
    const [isEditingCat, setIsEditingCat] = useState(false);
    const [editingCatId, setEditingCatId] = useState(null);
    const [isEditingItem, setIsEditingItem] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [selectedCatId, setSelectedCatId] = useState(null);

    // --- HELPER: SAFE JSON PARSE ---
    const safeParse = (data) => {
        if (!data) return [];
        if (typeof data === 'object') return data;
        try { return JSON.parse(data); } 
        catch (e) { return []; }
    };

    // --- DATA FETCHING ---
    const fetchMenu = useCallback(async () => {
        if (!res.id) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/menu/${res.id}`);
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (err) { console.error("Menu fetch failed"); }
    }, [res.id]);

    const fetchInventory = useCallback(async () => {
        if (!res.id) return;
        try {
            const response = await axios.get(`http://localhost:8000/api/inventory/${res.id}`);
            setInventory(response.data);
        } catch (err) { console.error("Inventory fetch failed"); }
    }, [res.id]);

    useEffect(() => { 
        fetchMenu(); 
        fetchInventory(); 
    }, [fetchMenu, fetchInventory]);

    // --- CATEGORY HANDLERS ---
    const openAddCategory = () => {
        setIsEditingCat(false);
        setCatForm({ name: '', description: '' });
        setShowCatModal(true);
    };

    const openEditCategory = (cat) => {
        setIsEditingCat(true);
        setEditingCatId(cat.id);
        setCatForm({ name: cat.name, description: cat.description });
        setShowCatModal(true);
    };

    const handleCatSubmit = async (e) => {
        e.preventDefault();
        const url = isEditingCat ? `http://localhost:8000/api/menu/category/update/${editingCatId}` : `http://localhost:8000/api/menu/category`;
        try {
            await axios.post(url, { ...catForm, restaurant_id: res.id });
            setShowCatModal(false);
            fetchMenu();
        } catch (err) { alert("Failed to save category"); }
    };

    // --- ITEM HANDLERS ---
    const openAddItem = (catId) => {
        setIsEditingItem(false);
        setSelectedCatId(catId);
        setItemForm(emptyItem);
        setPriceOptions([{ qty: '', price: '' }]);
        setIngredients([{ inventory_id: '', quantity: '' }]);
        setShowItemModal(true);
    };

    const openEditItem = (item, catId) => {
        setIsEditingItem(true);
        setEditingItemId(item.id);
        setSelectedCatId(catId);
        setItemForm({
            name: item.name,
            description: item.description || '',
            price: item.price || '',
            tag: item.tag || '',
            price_type: item.price_type || 'fixed',
            image: null 
        });
        const parsedPrices = safeParse(item.price_options);
        setPriceOptions(parsedPrices.length > 0 ? parsedPrices : [{ qty: '', price: '' }]);
        setIngredients(item.ingredients?.length > 0 
            ? item.ingredients.map(ing => ({ inventory_id: ing.inventory_id, quantity: ing.quantity_needed }))
            : [{ inventory_id: '', quantity: '' }]
        );
        setShowItemModal(true);
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        if (!isEditingItem && !itemForm.image) return alert("Image is mandatory!");
        
        const data = new FormData();
        data.append('category_id', selectedCatId);
        data.append('name', itemForm.name);
        data.append('description', itemForm.description || '');
        data.append('tag', itemForm.tag);
        data.append('price_type', itemForm.price_type);

        if (itemForm.price_type === 'fixed') data.append('price', itemForm.price);
        else data.append('price_options', JSON.stringify(priceOptions));

        if (itemForm.image) data.append('image', itemForm.image);
        data.append('ingredients', JSON.stringify(ingredients));

        const url = isEditingItem ? `http://localhost:8000/api/menu/item/update/${editingItemId}` : `http://localhost:8000/api/menu/item`;
        try {
            await axios.post(url, data);
            setShowItemModal(false);
            fetchMenu();
        } catch (err) { alert("Error saving item"); }
    };

    const deleteItem = async (id) => {
        if (window.confirm("Delete this item?")) {
            await axios.delete(`http://localhost:8000/api/menu/item/${id}`);
            fetchMenu();
        }
    };

    return (
        <div style={styles.app}>
            <TopBar role={role} />
            <div style={{ ...styles.container, padding: '100px 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1100px' }}>
                    <h1 style={{ fontFamily: 'Verdana' }}>Menu Management</h1>
                    <button onClick={openAddCategory} style={{ ...styles.button, width: 'auto', padding: '10px 25px', backgroundColor: res.accent_color }}>+ ADD CATEGORY</button>
                </div>

                {categories.length === 0 ? (
                    <div style={{marginTop: '50px', textAlign: 'center', color: '#888'}}>
                        <p>No categories found. Click "+ Add Category" to get started.</p>
                    </div>
                ) : (
                    categories.map(cat => (
                        <div key={cat.id} style={{ ...styles.wideCard, marginTop: '30px', borderLeft: `8px solid ${res.accent_color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>{cat.name}</h2>
                                    <p style={{ fontSize: '13px', color: '#666' }}>{cat.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => openEditCategory(cat)} style={editBtnStyle}>✏️ EDIT</button>
                                    <button onClick={() => openAddItem(cat.id)} style={{ ...styles.button, width: 'auto', padding: '5px 15px', fontSize: '11px', backgroundColor: res.accent_color }}>+ ADD ITEM</button>
                                    <button onClick={() => axios.delete(`http://localhost:8000/api/menu/category/${cat.id}`).then(fetchMenu)} style={delBtnWhite}>❌</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
                                {cat.items?.map(item => (
                                    <div key={item.id} style={item.image ? cardStyle : listRowStyle}>
                                        {item.image && <img src={`http://localhost:8000/storage/${item.image}`} style={imgStyle} alt="" />}
                                        <div style={{ flex: 1, padding: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong style={{ fontSize: '16px' }}>{item.name}</strong>
                                                {item.tag && <span style={{ ...tagStyle, backgroundColor: res.accent_color }}>{item.tag}</span>}
                                            </div>
                                            <p style={{ fontSize: '12px', color: '#777', margin: '8px 0' }}>{item.description || "No description."}</p>

                                            <div style={{ marginTop: '10px' }}>
                                                {item.price_type === 'fixed' ? (
                                                    <span style={{ fontWeight: 'bold', color: res.accent_color }}>৳{item.price}</span>
                                                ) : (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                        {safeParse(item.price_options).map((opt, idx) => (
                                                            <span key={idx} style={variationBadge}>{opt.qty}: ৳{opt.price}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                <button onClick={() => openEditItem(item, cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: res.accent_color, fontSize: '12px', fontWeight: 'bold' }}>✏️ Edit</button>
                                                <button onClick={() => deleteItem(item.id)} style={delBtnWhite}>❌</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* CATEGORY MODAL */}
            {showCatModal && (
                <div style={modalOverlay}>
                    <form style={styles.card} onSubmit={handleCatSubmit}>
                        <h3>{isEditingCat ? 'Edit Category' : 'New Category'}</h3>
                        <input placeholder="Name" style={styles.input} value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} required />
                        <textarea placeholder="Description" style={styles.input} value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} />
                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color }}>SAVE</button>
                        <button type="button" onClick={() => setShowCatModal(false)} style={{ ...styles.button, background: '#444' }}>CANCEL</button>
                    </form>
                </div>
            )}

            {/* ITEM MODAL */}
            {showItemModal && (
                <div style={modalOverlay}>
                    <form style={{ ...styles.card, maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }} onSubmit={handleItemSubmit}>
                        <h3>{isEditingItem ? 'Edit Item' : 'Add Item'}</h3>
                        
                        <label style={lbl}>Item Name</label>
                        <input style={styles.input} value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} required />
                        
                        <label style={lbl}>Description</label>
                        <textarea style={styles.input} value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} />

                        <div style={{display:'flex', gap: '10px'}}>
                            <div style={{flex:1}}>
                                <label style={lbl}>Price Type</label>
                                <select style={styles.input} value={itemForm.price_type} onChange={e => setItemForm({...itemForm, price_type: e.target.value})} required>
                                    <option value="">Select Type</option>
                                    <option value="fixed">Fixed Price</option>
                                    <option value="quantity">Quantity Price</option>
                                </select>
                            </div>
                            <div style={{flex:1}}>
                                <label style={lbl}>Tag (Optional)</label>
                                <select style={styles.input} value={itemForm.tag} onChange={e => setItemForm({...itemForm, tag: e.target.value})}>
                                    <option value="">None</option>
                                    <option value="new">New</option>
                                    <option value="best-selling">Best Selling</option>
                                    <option value="spicy">Spicy</option>
                                    <option value="extra-spicy">Extra Spicy</option>
                                    <option value="vegetarian">Vegetarian</option>
                                </select>
                            </div>
                        </div>

                        {itemForm.price_type === 'fixed' && (
                            <input type="number" placeholder="Price (৳)" style={styles.input} value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} required />
                        )}

                        {itemForm.price_type === 'quantity' && (
                            <div>
                                {priceOptions.map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                                        <input placeholder="Size (e.g. 1:1)" style={styles.input} value={opt.qty} onChange={e => {
                                            let newOpt = [...priceOptions]; newOpt[i].qty = e.target.value; setPriceOptions(newOpt);
                                        }} required />
                                        <input placeholder="Price" type="number" style={styles.input} value={opt.price} onChange={e => {
                                            let newOpt = [...priceOptions]; newOpt[i].price = e.target.value; setPriceOptions(newOpt);
                                        }} required />
                                    </div>
                                ))}
                                <button type="button" onClick={() => setPriceOptions([...priceOptions, {qty:'', price:''}])} style={addMoreBtn}>+ Add Option</button>
                            </div>
                        )}

                        <label style={lbl}>Ingredients (Inventory)</label>
                        {ingredients.map((ing, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                                <select style={{ ...styles.input, flex: 2 }} value={ing.inventory_id} onChange={e => {
                                    let n = [...ingredients]; n[idx].inventory_id = e.target.value; setIngredients(n);
                                }}>
                                    <option value="">Select Ingredient</option>
                                    {inventory.map(i => <option key={i.id} value={i.id}>{i.item_name}</option>)}
                                </select>
                                <input placeholder="Qty" style={{ ...styles.input, flex: 1 }} value={ing.quantity} onChange={e => {
                                    let n = [...ingredients]; n[idx].quantity = e.target.value; setIngredients(n);
                                }} />
                            </div>
                        ))}
                        <button type="button" onClick={() => setIngredients([...ingredients, {inventory_id:'', quantity:''}])} style={addMoreBtn}>+ Add Ingredient</button>

                        <label style={lbl}>Image {isEditingItem ? '(Leave blank to keep current)' : '(Mandatory)'}</label>
                        <input type="file" style={styles.input} onChange={e => setItemForm({...itemForm, image: e.target.files[0]})} required={!isEditingItem} />

                        <button type="submit" style={{ ...styles.button, backgroundColor: res.accent_color, marginTop: '20px' }}>SAVE ITEM</button>
                        <button type="button" onClick={() => setShowItemModal(false)} style={{ ...styles.button, background: '#444' }}>CANCEL</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const delBtnWhite = { background: 'white', color: '#ff4d4d', border: '1px solid #eee', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '14px' };
const editBtnStyle = { background: '#eee', border: '1px solid #ccc', cursor: 'pointer', padding: '5px 12px', borderRadius: '4px', fontSize: '11px', fontFamily: 'Verdana', fontWeight: 'bold' };
const tagStyle = { color: 'white', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' };
const variationBadge = { fontSize: '11px', background: '#f0f0f0', padding: '3px 7px', borderRadius: '4px', border: '1px solid #ddd' };
const cardStyle = { width: '260px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const listRowStyle = { width: '100%', background: '#fff', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', border: '1px solid #eee' };
const imgStyle = { width: '100%', height: '160px', objectFit: 'cover' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const lbl = { fontSize: '11px', fontWeight: 'bold', display: 'block', marginTop: '10px', color: '#666', textTransform: 'uppercase' };
const addMoreBtn = { background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', padding: '5px 10px', marginTop: '5px' };

export default MenuManagement;