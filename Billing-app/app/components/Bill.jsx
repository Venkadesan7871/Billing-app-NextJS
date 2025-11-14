"use client"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "../css/bill.css";
import { useDispatch } from "react-redux";

export function Bill({ state }) {
  const [paid, setPaid] = useState(false);
  const [paidAt, setPaidAt] = useState(null);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [email, setemail] = useState('');
  const [restaurantDetails, setRestaurantDetails] = useState({ name: "", address: "", contact: "" });
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const printableRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch()
  // derive bill data from state
  const items = Array.isArray(state?.cardInfo) ? state.cardInfo : [];
  const parseAmount = (str) => {
    if (typeof str !== "string") return 0;
    const num = parseFloat(str.replace(/[^\d.]/g, ""));
    return isNaN(num) ? 0 : num;
  };
  const subtotal = items.reduce((sum, it) => sum + (it.quantity || 0) * parseAmount(it.cost), 0);
  const cgstRate = 0.025;
  const sgstRate = 0.025;
  const cgst = subtotal * cgstRate;
  const sgst = subtotal * sgstRate;
  const total = subtotal + cgst + sgst;
  const fmt = (n) => `₹${n.toFixed(2)}`;
  const nowDisplay = new Date().toLocaleString();
  const uniqueInvoiceId = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}${String(new Date().getSeconds()).padStart(2, '0')}`;
  console.log(nowDisplay,'nowDisplay');

  // Load restaurant details from DB (billingdetails)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/billingdetails', { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const name = data.restaurantName || "";
        const address = data.address || "";
        const mobile = data.mobile || "";
        const email = data.email || "";
        const contact = [mobile, email].filter(Boolean).join(" | ");
        setRestaurantDetails({ name, address, contact });
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const ensureHtml2Pdf = () => new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.html2pdf) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });

  const generatePdfDataUrl = async () => {
    await ensureHtml2Pdf();
    const element = printableRef.current;
    const opt = {
      margin:       5,
      filename:     `${uniqueInvoiceId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    const worker = window.html2pdf().set(opt).from(element);
    const pdf = await worker.outputPdf('datauristring');
    return pdf;
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await ensureHtml2Pdf();
      const element = printableRef.current;
      const opt = {
        margin:       5,
        filename:     `${uniqueInvoiceId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await window.html2pdf().set(opt).from(element).save();
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) return;
    try {
      setSending(true);
      const dataUrl = await generatePdfDataUrl();
      const res = await fetch('/api/send-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, filename: `${uniqueInvoiceId}.pdf`, pdfDataUrl: dataUrl, meta: { subtotal, cgst, sgst, total, nowDisplay, uniqueInvoiceId, restaurantDetails } })
      });
      if (res.ok) {
        setShowWhatsAppPopup(false);
        setemail('');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bill-page">
      <div className="bill-actions no-print">
        <button className="btn" onClick={() => {
          if (paid) dispatch({ type: "RESET_ITEMS" })
          router.push("?view=Dashboard")
        }}>← Back to Dashboard</button>
        <button className="btn btn-secondary" onClick={handleDownloadPdf} disabled={downloading}>
          <span className="material-icon material-symbols-outlined">download</span>
          {downloading ? "Preparing..." : "Download PDF"}
        </button>
        <button
          className={`btn ${paid ? "btn-dark" : "btn-success"}`}
          onClick={() => { setPaid(true); setPaidAt(new Date()); dispatch({ type: "PAID_BILL", data: { paid: true, subtotal, cgst, sgst, total, nowDisplay, paidItems: items, date: new Date().toLocaleString().split(",")[0], time: new Date().toLocaleString().split(",")[1], restaurantDetails, uniqueInvoiceId } }) }}
          disabled={paid}
        >
          <span className="material-icon material-symbols-outlined">
            {paid ? "verified" : "task_alt"}
          </span>
          {paid ? "Paid Bill" : "Mark Paid"}
        </button>
        <button className="btn btn-primary-bill" onClick={() => window.print()}>
          <span className="material-icon material-symbols-outlined">print</span>
          Print Bill
        </button>
        <button 
          className="btn btn-success-email" 
          onClick={() => setShowWhatsAppPopup(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
         <span className="material-icon material-symbols-outlined">Email</span>
          Email
        </button>
      </div>

      <div className="printable-area" ref={printableRef}>
        <div className="bill-header">
          <div className="bill-brand">
            <h1 className="brand-title-bill">{restaurantDetails.name}</h1>
            <p className="brand-subtitle">
              {restaurantDetails.address}
              <br />
              {restaurantDetails.contact}
            </p>
          </div>
          <div className="bill-meta">
            <h2 className="bill-receipt">RECEIPT</h2>
            <p className="bill-receipt-id">{uniqueInvoiceId}</p>
          </div>
        </div>

        <div className="bill-info">
          <div className="info-item">
            <p className="info-label">Bill No:</p>
            <p className="info-value">{uniqueInvoiceId}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Date:</p>
            <p className="info-value">{nowDisplay.split(',')[0]}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Table:</p>
            <p className="info-value">12B</p>
          </div>
          <div className="info-item">
            <p className="info-label">Cashier:</p>
            <p className="info-value">Shiny</p>
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
                    <td className="cell" colSpan={4}>No items added</td>
                  </tr>
                ) : (
                  items.map((it, idx) => {
                    const rateNum = parseAmount(it.cost);
                    const amount = (it.quantity || 0) * rateNum;
                    return (
                      <tr key={`${it.name}-${idx}`}>
                        <td className="cell">{it.name}</td>
                        <td className="cell text-center">{it.quantity}</td>
                        <td className="cell muted">{it.cost}</td>
                        <td className="cell ">{fmt(amount)}</td>
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
              <p>{fmt(subtotal)}</p>
            </div>
            <div className="total-row">
              <p className="muted">CGST (2.5%)</p>
              <p>{fmt(cgst)}</p>
            </div>
            <div className="total-row">
              <p className="muted">SGST (2.5%)</p>
              <p>{fmt(sgst)}</p>
            </div>
            <div className="total-row total-final">
              <p className="total-title">Total</p>
              <p className="total-amount">{fmt(total)}</p>
            </div>
          </div>
        </div>

        {paid && (
          <div className="paid-stamp" aria-label="Paid stamp">
            <span className="stamp-main">PAID</span>
            <span className="stamp-date">{paidAt ? paidAt.toLocaleString() : ""}</span>
          </div>
        )}

        <div className="bill-footer">
          <p className="muted text-center">Thank you for visiting!</p>
        </div>
      </div>

      {/* WhatsApp Popup */}
      {showWhatsAppPopup && (
        <div className="whatsapp-popup-overlay">
          <div className="whatsapp-popup">
            <div className="popup-header">
              <h3>Send Bill via E-mail</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowWhatsAppPopup(false);
                  setemail('');
                }}
              >
                &times;
              </button>
            </div>
            <div className="popup-body">
              <input
                type="email"
                placeholder="Enter Email address"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                className="whatsapp-input"
              />
              <button 
                className="btn btn-primary-bill"
                onClick={handleSendEmail}
                disabled={sending || !email}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}