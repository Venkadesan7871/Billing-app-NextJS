"use client";
import { useEffect, useMemo, useState } from "react";
import "../css/dashboard.css";
import { Dashboard } from "./Dashboard";
import { Menu } from "./Menu";
import { Bill } from "./Bill";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Report from "./Report";
export default function ContentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();        
    const state = useSelector((state) => state.state);
    const dispatch = useDispatch();
    const [hydrated, setHydrated] = useState(false);
    const activePage = useMemo(() => searchParams.get("view") || "Dashboard", [searchParams]);
    const hasCart = !!(state.cardInfo && state.cardInfo.length > 0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/billingdetails', { method: 'GET' });
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                dispatch({ type: 'HYDRATE_ALL', payload: {
                    menuItems: data.menuItems || [],
                    addedItems: data.addedItems || [],
                    cardInfo: data.cardInfo || [],
                    report: data.report || []
                }});
                setHydrated(true);
            } catch {}
        })();
        return () => { cancelled = true; };
    }, [dispatch]);

    useEffect(() => {
        if (!hydrated) return; // Avoid overwriting DB before initial hydration
        const t = setTimeout(() => {
            fetch('/api/billingdetails', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    menuItems: state.menuItems,
                    addedItems: state.addedItems,
                    cardInfo: state.cardInfo,
                    report: state.report,
                })
            }).catch(() => {});
        }, 1000);
        return () => clearTimeout(t);
    }, [hydrated, state.menuItems, state.addedItems, state.cardInfo, state.report]);

    return (
        <div className="dashboard font-display">
            {(activePage !== "Bill" || !hasCart) && (
                <aside className="sidebar">
                    <div className="sidebar-inner">
                        <div className="brand">
                            <div className="brand-mark" aria-hidden="true" style={{ transform: 'scale(2)' }}>
                                <svg width="320" height="120" viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Shiny text logo"><defs><linearGradient id="shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fde68a" /><stop offset="45%" stopColor="#fbbf24" /><stop offset="55%" stopColor="#ffffff" stopOpacity=".9" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter><linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ffffff" stopOpacity="0" /><stop offset="50%" stopColor="#ffffff" stopOpacity=".8" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" /></linearGradient><clipPath id="textClip"><text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontFamily="Poppins, Inter, system-ui, Arial, sans-serif" fontWeight="800" fontSize="140">Shiny</text></clipPath></defs><text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontFamily="Poppins, Inter, system-ui, Arial, sans-serif" fontWeight="900" fontSize="140" fill="#000" opacity=".25" transform="translate(0,6)">Shiny</text><text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontFamily="Poppins, Inter, system-ui, Arial, sans-serif" fontWeight="900" fontSize="140" fill="url(#shine)" filter="url(#glow)" stroke="#7c2d12" strokeWidth="2">Shiny</text><rect clipPath="url(#textClip)" x="0" y="0" width="640" height="240" fill="url(#sheen)" opacity=".35" /></svg>                        </div>
                            <h1 className="brand-title">Restaurant Billing</h1>
                        </div>
                        <nav className="nav">
                            <a className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); router.push("?view=Dashboard"); }}>
                                <span className="ms ms-dashboard material-symbols-outlined" aria-hidden="true">Dashboard</span>
                                <p>Dashboard</p>
                            </a>
                            <a className={`nav-item ${activePage === "Menu" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); router.push("?view=Menu"); }}>
                                <span className="ms ms-restaurant_menu material-symbols-outlined" aria-hidden="true">restaurant_menu</span>
                                <p>Menu Items</p>
                            </a>
                            <a className={`nav-item ${activePage === "Report" ? "active" : ""}`} href="#" onClick={(e) => { e.preventDefault(); router.push("?view=Report"); }}>
                                <span className="ms ms-bar_chart material-symbols-outlined" aria-hidden="true">bar_chart</span>
                                <p>Reports</p>
                            </a>
                            {/* <a className="nav-item" href="#">
                                <span className="ms ms-settings material-symbols-outlined" aria-hidden="true">settings</span>
                                <p>Settings</p>
                            </a> */}
                        </nav>
                    </div>
                </aside>
            )}
            {(activePage === "Dashboard" || (activePage === "Bill" && !hasCart)) && <Dashboard />}
            {activePage === "Menu" && <Menu />}
            {activePage === "Report" && <Report/>}
            {activePage === "Bill" && hasCart && <Bill state={state}/>}
        </div>
    );
}



