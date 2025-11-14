"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../css/report.css";
import { useSelector } from "react-redux";

export default function Report() {
  const [activeFilter, setActiveFilter] = useState("Over All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showVisualData, setShowVisualData] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, seg: null });
  const [viewMode, setViewMode] = useState('price'); // 'price' or 'quantity'
  const [chartKey, setChartKey] = useState(0); // Used to force re-render chart when filters change
  const router = useRouter();
  const state = useSelector((state) => state.state);
  console.log(state, 'stateHERE');

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (filter !== "Custom Range") {
      setStartDate("");
      setEndDate("");
    }
    setChartKey(prev => prev + 1); // Force chart to re-render with new filter
    console.log(`Filter changed to: ${filter}`);
  };

  const formatINR = (value) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value) || 0);
    } catch {
      return `₹${(Number(value) || 0).toFixed(2)}`;
    }
  };

  const getReportDate = (r) => {
    const [dd, mm, yyyy] = (r.date || "").split("/");
    const [hh = "0", mi = "0", ss = "0"] = (r.time || "").trim().split(":");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss));
    return d;
  };

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const startOfWeek = (() => {
    const d = new Date(startOfToday);
    const day = d.getDay();
    const diff = (day === 0 ? 6 : day - 1); // Monday as start
    d.setDate(d.getDate() - diff);
    return d;
  })();
  const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6, 23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const customStart = useMemo(() => {
    if (!startDate) return null;
    const d = new Date(startDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [startDate]);

  const customEnd = useMemo(() => {
    if (!endDate) return null;
    const d = new Date(endDate);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [endDate]);

  const filteredReports = useMemo(() => {
    const reports = Array.isArray(state?.report) ? state.report : [];
    switch (activeFilter) {
      case "Today":
        return reports.filter(r => {
          const d = getReportDate(r);
          return d >= startOfToday && d <= endOfToday;
        });
      case "This Week":
        return reports.filter(r => {
          const d = getReportDate(r);
          return d >= startOfWeek && d <= endOfWeek;
        });
      case "This Month":
        return reports.filter(r => {
          const d = getReportDate(r);
          return d >= startOfMonth && d <= endOfMonth;
        });
      case "Custom Range":
        if (!customStart && !customEnd) return reports;
        return reports.filter(r => {
          const d = getReportDate(r);
          if (customStart && d < customStart) return false;
          if (customEnd && d > customEnd) return false;
          return true;
        });
      case "Over All":
      default:
        return reports;
    }
  }, [state?.report, activeFilter, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, customStart, customEnd]);

  const totals = useMemo(() => {
    let revenue = 0;
    let orders = 0;
    let items = 0;
    for (const r of filteredReports) {
      revenue += Number(r.total) || 0;
      orders += 1;
      if (Array.isArray(r.paidItems)) {
        for (const pi of r.paidItems) {
          items += Number(pi.quantity) || 0;
        }
      }
    }
    return { revenue, orders, items };
  }, [filteredReports]);

  // no-op
  const parseINRNumber = (str) => Number(String(str).replace(/[^0-9.]/g, "")) || 0;

  const getFilteredReports = useMemo(() => {
    const reports = Array.isArray(state?.report) ? state.report : [];
    switch (activeFilter) {
      case 'Today':
        return reports.filter(r => {
          const d = getReportDate(r);
          return d >= startOfToday && d <= endOfToday;
        });
      case 'This Week':
        return reports.filter(r => {
          const d = getReportDate(r);
          return d >= startOfWeek && d <= endOfWeek;
        });
      case 'This Month':
        return reports.filter(r => {
          const d = getReportDate(r);
          return d >= startOfMonth && d <= endOfMonth;
        });
      case 'Custom Range':
        if (!customStart && !customEnd) return reports;
        return reports.filter(r => {
          const d = getReportDate(r);
          if (customStart && d < customStart) return false;
          if (customEnd && d > customEnd) return false;
          return true;
        });
      case 'Over All':
      default:
        return reports;
    }
  }, [state?.report, activeFilter, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, customStart, customEnd]);

  const itemPieData = useMemo(() => {
    const filteredReports = getFilteredReports;

    const totalsByItem = new Map();
    for (const r of filteredReports) {
      if (!Array.isArray(r.paidItems)) continue;
      for (const pi of r.paidItems) {
        const qty = Number(pi.quantity) || 0;
        const price = parseINRNumber(pi.cost);
        const value = viewMode === 'price' ? qty * price : qty;
        const prev = totalsByItem.get(pi.name) || 0;
        totalsByItem.set(pi.name, prev + value);
      }
    }

    const entries = Array.from(totalsByItem.entries())
      .map(([name, value]) => ({ 
        name, 
        value,
        displayValue: viewMode === 'price' ? formatINR(value) : value
      }))
      .sort((a, b) => b.value - a.value);

    const total = entries.reduce((acc, e) => acc + e.value, 0);
    const colors = [
      "#6366F1",
      "#F59E0B",
      "#10B981",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#84CC16",
      "#F97316",
      "#EC4899",
      "#22C55E",
    ];

    let acc = 0;
    const segments = entries.map((e, i) => {
      const pct = total > 0 ? (e.value / total) * 100 : 0;
      const start = acc;
      const end = acc + pct;
      acc = end;
      return { 
        color: colors[i % colors.length], 
        start, 
        end, 
        ...e,
        displayValue: e.displayValue,
        rawValue: e.value
      };
    });

    const gradientStops = segments
      .map((s) => `${s.color} ${s.start}% ${s.end}%`)
      .join(", ");

    return { 
      segments, 
      gradientStops, 
      total, 
      entries,
      displayTotal: viewMode === 'price' ? formatINR(total) : total,
      unit: viewMode === 'price' ? '₹' : ''
    };
  }, [getFilteredReports, viewMode]);

  const handlePieMouseMove = (e) => {
    if (!itemPieData || !itemPieData.segments?.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = e.clientX - cx;
    const y = e.clientY - cy;
    const r = Math.sqrt(x * x + y * y);
    const radius = rect.width / 2;
    if (r > radius) {
      setTooltip((t) => ({ ...t, visible: false }));
      return;
    }
    let deg = (Math.atan2(y, x) * 180) / Math.PI; // -180..180
    if (deg < 0) deg += 360;
    const pct = (deg / 360) * 100;
    const seg = itemPieData.segments.find((s) => pct >= s.start && pct < s.end) || null;
    if (seg) {
      setTooltip({ visible: true, x: e.clientX + 12, y: e.clientY + 12, seg });
    } else {
      setTooltip((t) => ({ ...t, visible: false }));
    }
  };

  const handlePieMouseLeave = () => setTooltip({ visible: false, x: 0, y: 0, seg: null });

  return (
    <div className="report font-display">
      <main className="report-main">
        <div className="report-container">
          <div className="report-header">
            <div className="report-titlewrap">
              <h2 className="report-title">Sales Reports</h2>
              <p className="report-subtitle">Analyze your sales data and track performance.</p>
            </div>
            {/* <button className="btn btn-export">
              <span className="material-symbols-outlined">download</span>
              <span>Export Report</span>
            </button> */}
          </div>

          <div className="report-filters">
            {[
              "Over All",
              "Today",
              "This Week",
              "This Month",
              "Custom Range",
            ].map((filter) => (
              <button
                key={filter}
                className={`chip ${activeFilter === filter ? "chip-primary" : ""}`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
                {filter === "Custom Range" && (
                  <span className="material-symbols-outlined">calendar_today</span>
                )}
              </button>
            ))}
            {activeFilter === "Custom Range" && (
              <div className="custom-range-inputs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="stats-grid">
            <div className="card-report">
              <p className="card-label">Total Revenue</p>
              <p className="card-value">{formatINR(totals.revenue)}</p>
              <p className="card-diff card-diff-pos"></p>
            </div>
            <div className="card-report">
              <p className="card-label">Total Orders</p>
              <p className="card-value">{totals.orders}</p>
              <p className="card-diff card-diff-pos"></p>
            </div>
            <div className="card-report">
              <p className="card-label">Items Sold</p>
              <p className="card-value">{totals.items}</p>
              <p className="card-diff card-diff-pos"></p>
            </div>
          </div>

            <div className="bills-section">
              <div className="section-header">
                <h3 className="section-title">Bills</h3>
                <button 
                  className="btn-view"
                  onClick={() => setShowVisualData(true)}
                >
                  Visual Data
                </button>
              </div>
            <div className="bills-list">
              {filteredReports.length === 0 ? (
                <p className="empty">No bills to display for this filter.</p>
              ) : (
                filteredReports.map((r, i) => {
                  const items = Array.isArray(r.paidItems) ? r.paidItems : [];
                  const itemCount = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
                  const itemNames = items.map((it) => `${it.quantity}x ${it.name}`).join(", ");
                  return (
                    <div className="bill-row" key={r.uniqueInvoiceId}>
                      <div className="bill-cell bill-serial">{i + 1}</div>
                      <div className="bill-cell bill-id">#{r.uniqueInvoiceId}</div>
                      <div className="bill-cell bill-date">{r.date} {String(r.time || "").trim()}</div>
                      <div className="bill-cell bill-items">{itemCount} items — {itemNames}</div>
                      <div className={`bill-cell bill-paid ${r.paid ? 'paid' : 'unpaid'}`}>{r.paid ? 'Paid' : 'Unpaid'}</div>
                      <div className="bill-cell bill-total">{formatINR(r.total)}</div>
                      <div className="bill-cell bill-actions-report"><button className="btn-view" onClick={() => router.push(`/bill/${r.uniqueInvoiceId}`)}>View Bill</button></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {showVisualData && (
            <div className="modal-overlay" onClick={() => setShowVisualData(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Sales Analytics</h3>
                  <button 
                    className="close-modal"
                    onClick={() => setShowVisualData(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <div className="chart-container">
                    <div key={chartKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', width: '100%' }}>
                      <h4>Items Sold {activeFilter === 'Over All' ? '' : activeFilter} ({viewMode === 'price' ? 'Revenue' : 'Quantity'})</h4>
                      <div className="view-toggle" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className={`toggle-btn ${viewMode === 'price' ? 'active' : ''}`}
                          onClick={() => setViewMode('price')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            background: viewMode === 'price' ? '#6366F1' : 'white',
                            color: viewMode === 'price' ? 'white' : '#333',
                            cursor: 'pointer',
                            fontWeight: viewMode === 'price' ? 'bold' : 'normal'
                          }}
                        >
                          Price
                        </button>
                        <button 
                          className={`toggle-btn ${viewMode === 'quantity' ? 'active' : ''}`}
                          onClick={() => setViewMode('quantity')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            background: viewMode === 'quantity' ? '#6366F1' : 'white',
                            color: viewMode === 'quantity' ? 'white' : '#333',
                            cursor: 'pointer',
                            fontWeight: viewMode === 'quantity' ? 'bold' : 'normal'
                          }}
                        >
                          Quantity
                        </button>
                      </div>
                    </div>
                    {itemPieData.total === 0 ? (
                      <p className="empty">No sales data available for the selected period.</p>
                    ) : (
                      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" ,flexDirection:"column"}}>
                        <div style={{ position: "relative", width: 260, height: 260 }}>
                          <div
                            style={{
                              position: "absolute",
                              top: 20,
                              left: 20,
                              width: 220,
                              height: 220,
                              borderRadius: "50%",
                              background: `conic-gradient(${itemPieData.gradientStops})`,
                              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                              cursor: "pointer",
                              transform: "rotate(90deg)",
                            }}
                            aria-label="Pie chart of today's item-wise revenue"
                            role="img"
                            onMouseMove={handlePieMouseMove}
                            onMouseLeave={handlePieMouseLeave}
                          />
                          {itemPieData.segments.map((s) => {
                            const percent = s.end - s.start;
                            if (percent < 3) return null; // skip tiny slices to reduce clutter
                            const midPct = (s.start + s.end) / 2; // 0..100
                            const angleRad = (midPct / 100) * Math.PI * 2; // radians
                            const cx = 130; // container center (260/2)
                            const cy = 130;
                            const r = 140; // place labels outside the pie
                            const cos = Math.cos(angleRad);
                            const sin = Math.sin(angleRad);
                            const lx = cx + r * cos;
                            const ly = cy + r * sin;
                            const isLeft = cos < 0;
                            const alignTransform = isLeft ? "translate(-100%, -50%)" : "translate(0, -50%)";
                            const textAlign = isLeft ? "right" : "left";
                            const padSide = isLeft ? { paddingRight: 8 } : { paddingLeft: 8 };
                            return (
                              <div
                                key={s.name}
                                style={{
                                  position: "absolute",
                                  left: lx,
                                  top: ly,
                                  transform: alignTransform,
                                  fontSize: 12,
                                  background: "rgba(255,255,255,0.9)",
                                  paddingTop: "2px",
                                  paddingBottom: "2px",
                                  paddingLeft: isLeft ? "6px" : "12px",
                                  paddingRight: isLeft ? "12px" : "6px",
                                  borderRadius: 6,
                                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                  pointerEvents: "none",
                                  textAlign,
                                  display: "flex",
                                  alignItems: "center",
                                  columnGap: "5px",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                <span style={{ display: "inline-block", width: 8, height: 8, background: s.color, borderRadius: 2, marginRight: isLeft ? 0 : 6, marginLeft: isLeft ? 6 : 0 }} />
                                {s.name} ({s.displayValue}) {percent.toFixed(0)}%
                              </div>
                            );
                          })}
                        </div>
                        <div>
                          {itemPieData.segments.map((s) => (
                            <div key={s.name} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                              <span style={{ display: "inline-block", width: 12, height: 12, background: s.color, borderRadius: 2, marginRight: 8 }} />
                              <span style={{ minWidth: 140 }}>{s.name}</span>
                              <strong style={{ marginLeft: 8 }}>{s.displayValue}</strong>
                              <span style={{ marginLeft: 8, color: "#6B7280" }}>{s.end - s.start > 0 ? `${(s.end - s.start).toFixed(1)}%` : ""}</span>
                            </div>
                          ))}
                          <div style={{ marginTop: 12, color: "#374151" }}>
                            Total: <strong>{itemPieData.displayTotal}</strong> {viewMode === 'price' ? '' : 'items'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {tooltip.visible && tooltip.seg && (
                    <div
                      style={{
                        position: "fixed",
                        left: tooltip.x,
                        top: tooltip.y,
                        background: "#111827",
                        color: "#fff",
                        padding: "6px 8px",
                        fontSize: 12,
                        borderRadius: 6,
                        pointerEvents: "none",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        zIndex: 1000,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ display: "inline-block", width: 10, height: 10, background: tooltip.seg.color, borderRadius: 2, marginRight: 6 }} />
                        <strong>{tooltip.seg.name}</strong>
                      </div>
                      <div>{formatINR(tooltip.seg.value)} • {(tooltip.seg.end - tooltip.seg.start).toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}