"use client";
import "./menu.css";
import { Work_Sans } from 'next/font/google';
import { MenuItemCard } from "./MenuItemCard";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const workSans = Work_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});
export function Menu(props) {
const state = useSelector((state) => state.state);
const dispatch = useDispatch();

const [showAdd, setShowAdd] = useState(false);
const [showEdit, setShowEdit] = useState(false);
const [form, setForm] = useState({ name: "", cost: "", img: "", label: "", categories: [] });
const [editingOriginalName, setEditingOriginalName] = useState("");
const [editingId, setEditingId] = useState(null);
const [searchQuery, setSearchQuery] = useState("");

const CATEGORY_OPTIONS = [
    { value: 'tiffen', label: 'Tiffins' },
    { value: 'main', label: 'Main Course' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Beverages' },
];

const openAdd = () => {
    setForm({ name: "", cost: "", img: "", label: "", categories: [] });
    setShowAdd(true);
};
const openEdit = (menu) => {
    const cats = Array.isArray(menu.category) ? menu.category.filter(Boolean).filter(c=>c!=='all') : [];
    setForm({ name: menu.name || "", cost: menu.cost || "", img: menu.img || "", label: menu.label || "", categories: cats });
    setEditingOriginalName(menu.name || "");
    setEditingId(menu.id ?? null);
    setShowEdit(true);
};
const closeModals = () => {
    setShowAdd(false);
    setShowEdit(false);
    setEditingOriginalName("");
    setEditingId(null);
};
const onChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
const toggleCategory = (value) => {
    setForm(prev => {
        const exists = prev.categories.includes(value);
        return {
            ...prev,
            categories: exists ? prev.categories.filter(v => v !== value) : [...prev.categories, value]
        };
    });
};

const submitAdd = () => {
    if (!form.name) return;
    const maxId = Math.max(...state.menuItems.map(item => item.id));
    const item = { name: form.name, cost: "₹"+form.cost, img: form.img, label: form.label, category: ['all', ...form.categories], id: maxId + 1 };
    dispatch({ type: "ADD_MENU_ITEM", item });
    setShowAdd(false);
};
const submitEdit = () => {
    if (editingId == null) return;
    const item = { id: editingId, name: form.name, cost: form.cost, img: form.img, label: form.label, category: ['all', ...form.categories] };
    dispatch({ type: "UPDATE_MENU_ITEM", item });
    setShowEdit(false);
};
const deleteMenuItem = (menu) => {   
    let confrim = confirm("Confirm To Delete")
    if(confrim)
    dispatch({ type: "DELETE_MENU_ITEM", id: menu.id });
};

const filteredMenuItems = state.menuItems.filter((menu) =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase())
);

    return (
        <div className={`menu ${workSans.className}`} style={{ width: '100%', overflow: 'scroll' }}>
            <main className="menu-main">
                <div className="menu-container">
                    <div className="page-head">
                        <div className="page-head-left">
                            <h1 className="page-title">Menu Management</h1>
                            <p className="page-subtitle">Add, edit, or delete menu items from your restaurant's menu.</p>
                        </div>
                        <button className="btn-primary" onClick={openAdd}>
                            <span className="ms">+</span>
                            <span>Add New Item</span>
                        </button>
                    </div>

                    <div className="searchbar">
                        <label className="searchbar-label">
                            <div className="searchbar-inputwrap">
                                <div className="searchbar-icon" aria-hidden="true">🔍</div>
                                <input
                                    className="searchbar-input"
                                    placeholder="Find menu items by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </label>
                    </div>

                    <h2 className="section-title-menu">Current Menu</h2>

                    <div className="menu-grid">
                        {filteredMenuItems.map((menu, index) => (
                            <MenuItemCard
                                key={index}
                                menu={menu}
                                onEdit={openEdit}
                                onDelete={deleteMenuItem}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {showAdd && (
                <div className="modal-backdrop" role="dialog" aria-modal="true">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Item</h3>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <label className="label">Name</label>
                                <input className="input" value={form.name} onChange={(e)=>onChange('name', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="label">Cost</label>
                                <input className="input" value={form.cost} type="number" onChange={(e)=>onChange('cost', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="label">Image URL</label>
                                <input className="input" value={form.img} onChange={(e)=>onChange('img', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="label">Label</label>
                                <input className="input" value={form.label} onChange={(e)=>onChange('label', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="label">Categories</label>
                                <div>
                                    {CATEGORY_OPTIONS.map(opt => (
                                        <label key={opt.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 12, marginBottom: 6 }}>
                                            <input
                                                type="checkbox"
                                                checked={form.categories.includes(opt.value)}
                                                onChange={() => toggleCategory(opt.value)}
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModals}>Cancel</button>
                            <button className="btn-primary" onClick={submitAdd}>Add Item</button>
                        </div>
                    </div>
                </div>
            )}

            {showEdit && (
                <div className="modal-backdrop" role="dialog" aria-modal="true">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Item</h3>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <label className="label">Name</label>
                                <input className="input" value={form.name} onChange={(e)=>onChange('name', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="label">Cost</label>
                                <input className="input" value={form.cost} onChange={(e)=>onChange('cost', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="label">Image URL</label>
                                <input className="input" value={form.img} onChange={(e)=>onChange('img', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="label">Label</label>
                                <input className="input" value={form.label} onChange={(e)=>onChange('label', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="label">Categories</label>
                                <div>
                                    {CATEGORY_OPTIONS.map(opt => (
                                        <label key={opt.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 12, marginBottom: 6 }}>
                                            <input
                                                type="checkbox"
                                                checked={form.categories.includes(opt.value)}
                                                onChange={() => toggleCategory(opt.value)}
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModals}>Cancel</button>
                            <button className="btn-primary" onClick={submitEdit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}