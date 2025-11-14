"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import "../../css/bill.css";

export default function BillPage() {
  const params = useParams();
  const router = useRouter();
  
  const invoiceId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const state = useSelector((s) => s.state);
  const reports = Array.isArray(state?.report) ? state.report : [];
  const bill = reports.find((r) => r.uniqueInvoiceId === invoiceId);

  const formatINR = (value) => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
    } catch {
      return `₹${(Number(value) || 0).toFixed(2)}`;
    }
  };

  if (!bill) {
    return (
      <div className="bill-page">
        <div className="bill-actions no-print">
          <button className="btn" onClick={() => router.back()}>← Back</button>
        </div>
        <div className="printable-area">
          <p className="muted">Bill not found.</p>
        </div>
      </div>
    );
  }

  const items = Array.isArray(bill.paidItems) ? bill.paidItems : [];
  const restaurantDetails = bill.restaurantDetails || {};

  return (
    <div className="bill-page">
      <div className="bill-actions no-print">
        <button className="btn" onClick={() => router.back()}>← Back to Reports</button>
        <button className="btn btn-primary-bill" onClick={() => window.print()}>
          <span className="material-icon material-symbols-outlined">print</span>
          Print Bill
        </button>
      </div>

      <div className="printable-area">
        <div className="bill-header">
          <div className="bill-brand">
            <h1 className="brand-title-bill">{restaurantDetails.name || "Restaurant"}</h1>
            <p className="brand-subtitle">
              {restaurantDetails.address || ""}
              <br />
              {restaurantDetails.contact || ""}
            </p>
          </div>
          <div className="bill-meta">
            <h2 className="bill-receipt">RECEIPT</h2>
            <p className="bill-receipt-id">{bill.uniqueInvoiceId}</p>
          </div>
        </div>

        <div className="bill-info">
          <div className="info-item">
            <p className="info-label">Bill No:</p>
            <p className="info-value">{bill.uniqueInvoiceId}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Date:</p>
            <p className="info-value">{bill.date} {String(bill.time || "").trim()}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Status:</p>
            <p className="info-value">{bill.paid ? "Paid" : "Unpaid"}</p>
          </div>
        </div>

        <div className="bill-table">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="col-item">Item</th>
                  <th className="col-qty">Quantity</th>
                  <th className="col-rate">Rate</th>
                  <th className="col-amt">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="cell" colSpan={4}>No items</td>
                  </tr>
                ) : (
                  items.map((it, idx) => {
                    const qty = Number(it.quantity) || 0;
                    const num = Number(String(it.cost || "").replace(/[^0-9.]/g, "")) || 0;
                    const amt = qty * num;
                    return (
                      <tr key={`${it.name}-${idx}`}>
                        <td className="cell">{it.name}</td>
                        <td className="cell text-center">{qty}</td>
                        <td className="cell muted">{it.cost}</td>
                        <td className="cell ">{formatINR(amt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bill-totals">
          <div className="totals-box">
            <div className="total-row">
              <p className="muted">Subtotal</p>
              <p>{formatINR(bill.subtotal)}</p>
            </div>
            <div className="total-row">
              <p className="muted">CGST</p>
              <p>{formatINR(bill.cgst)}</p>
            </div>
            <div className="total-row">
              <p className="muted">SGST</p>
              <p>{formatINR(bill.sgst)}</p>
            </div>
            <div className="total-row total-final">
              <p className="total-title">Total</p>
              <p className="total-amount">{formatINR(bill.total)}</p>
            </div>
          </div>
        </div>
        <div className="paid-stamp" aria-label="Paid stamp">
          <span className="stamp-main">PAID</span>
          <span className="stamp-date">{bill.date} {String(bill.time || "").trim()}</span>
        </div>

        <div className="bill-footer">
          <p className="muted text-center">Thank you for visiting!</p>
        </div>
      </div>
    </div>
  );
}
