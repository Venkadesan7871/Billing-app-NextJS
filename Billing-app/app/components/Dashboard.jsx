"use client"
import React, { useEffect, useState, useRef } from "react";
import "../css/dashboard.css";
import { ItemCard } from "./ItemCard";
import { useDispatch, useSelector } from "react-redux";
import { OrderCard } from "./OrderCard";
import { useRouter, useSearchParams } from "next/navigation";
export function Dashboard(props) {
    const [itemCard, setItemCard] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const state = useSelector((state) => state.state);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [restaurantDetails, setRestaurantDetails] = useState({ name: "", address: "", contact: "", email: "" });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/billingdetails', { method: 'GET' });
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                console.log(data,'devda');
                
                const name = data.restaurantName || "";
                const address = data.address || "";
                const mobile = data.mobile || "";
                const email = data.email || "";
                const contact = [mobile, email].filter(Boolean).join(" | ");
                setRestaurantDetails({ name: data.username, address, contact, email });
            } catch { }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (e) {
            // ignore
        }
        router.push('/');
        router.refresh();
    };

    useEffect(() => {
        setItemCard(state.menuItems);
    }, [state.menuItems])

    const getNumber = (str) => parseFloat(str.replace(/[₹,]/g, ''));

    const subtotal = (state.cardInfo || []).reduce((sum, item) => {
        return sum + item.quantity * getNumber(item.cost);
    }, 0);

    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const view = searchParams.get('view');
    useEffect(() => {        
        if (view === 'Bill' && (!state.cardInfo || state.cardInfo.length === 0)) {
            router.replace("?");
        }
    }, [view, state.cardInfo?.length, router]);

    return (
        <div className="content">
            <header className="header">
                <div className="header-spacer" />
                <div className="user" ref={dropdownRef}>
                    <p className="user-name">{restaurantDetails.name}</p>
                    <div className="avatar-container">
                        <div
                            className="avatar"
                            role="img"
                            aria-label="User avatar image"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAo-11zcQ1yG-MkIRchGyZAvw3NWe1E7KZhLCZUIRLLkQAh2pz7uTxOzMAx7UfmLZnm-VZE8-dB8fm9euYv1KPvYeaeU25Re4wZy7ipIREx99kq9hC4CxM4J-jz2BpYcGIg0cAYXLct9-aVOxAv46pdT4fqdmbYJHd3HLKfsQWi_2chJ5GTFGVZ1LsqePd9kfGIV_1u8nsfU3FKx1eJUGmfVDyMXYdhWh147rEiBwj1OUVKeACmvEvgLKFIz1JDfrnT5moYOGRQ2fbk")',
                                cursor: 'pointer'
                            }}
                        />
                        {showDropdown && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <div className="user-email">{restaurantDetails.email}</div>
                                    <div className="user-role">User</div>
                                </div>
                                 <button className="dropdown-item" onClick={handleLogout}>
                                    <span className="material-symbols-outlined">logout</span>
                                    <span>Sign out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="main-left">
                    <div className="toolbar">
                        <h2 className="title">Dashboard</h2>
                        <div className="search">
                            <span className="ms ms-search material-symbols-outlined" aria-hidden="true">search</span>
                            <input
                                className="search-input"
                                placeholder="Search menu items..."
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="chips">
                        <button className={`chip ${activeCategory === 'all' ? 'chip-primary' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
                        <button className={`chip ${activeCategory === 'tiffen' ? 'chip-primary' : ''}`} onClick={() => setActiveCategory('tiffen')}>Tiffins</button>
                        <button className={`chip ${activeCategory === 'main' ? 'chip-primary' : ''}`} onClick={() => setActiveCategory('main')}>Main Course</button>
                        <button className={`chip ${activeCategory === 'desserts' ? 'chip-primary' : ''}`} onClick={() => setActiveCategory('desserts')}>Desserts</button>
                        <button className={`chip ${activeCategory === 'snacks' ? 'chip-primary' : ''}`} onClick={() => setActiveCategory('snacks')}>Snacks</button>
                        <button className={`chip ${activeCategory === 'beverages' ? 'chip-primary' : ''}`} onClick={() => setActiveCategory('beverages')}>Beverages</button>
                    </div>

                    <div className="cards">
                        {
                            itemCard && itemCard
                                .filter(item => (activeCategory === 'all' || item.category.includes(activeCategory)) &&
                                    item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((item, index) => {
                                    return <ItemCard key={index} item={item} />
                                })
                        }
                    </div>
                </div>

                <aside className="order">
                    <div className="order-head">
                        <h3>Current Order</h3>
                    </div>
                    <div className="order-list">
                        {state.cardInfo && state.cardInfo.map((card, index) => {
                            return <OrderCard key={index} item={card} />
                        })}
                    </div>
                    <div className="order-footer">
                        <div className="order-row">
                            <span>Subtotal</span>
                            <span className="strong">{`₹${subtotal.toFixed(2)}`}</span>
                        </div>
                        <div className="order-row">
                            <span>Taxes (5%)</span>
                            <span className="strong">{`₹${tax.toFixed(2)}`}</span>
                        </div>
                        <div className="order-dash" />
                        <div className="order-row total">
                            <span>Total</span>
                            <span>{`₹${total.toFixed(2)}`}</span>
                        </div>
                        <button className="btn-primary" onClick={() => {
                            if (state.cardInfo && state.cardInfo.length > 0)
                                router.push("?view=Bill");
                            else alert("Please Add Items")
                        }}>Generate Bill</button>
                    </div>
                </aside>
            </main>
        </div>
    )
}