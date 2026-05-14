'use client';

import { useState, useEffect } from 'react';

export default function WholesalerInvoices() {
  const [mounted, setMounted] = useState(false);
  const [monthFilter, setMonthFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All Crops');

  const invoices = [
    { id: 'INV-B2B001', date: new Date(Date.now() - 172800000).toISOString(), orderId: 'ORD-B2B-001', crop: 'Wheat (Lokwan)', quantity: 500, supplier: 'Raju Farms', amount: 10500, status: 'PAID' },
    { id: 'INV-B2B002', date: new Date(Date.now() - 432000000).toISOString(), orderId: 'ORD-B2B-002', crop: 'Onion (Nashik Red)', quantity: 200, supplier: 'Kumar Organic Farm', amount: 4800, status: 'PAID' },
    { id: 'INV-B2B003', date: new Date(Date.now() - 86400000).toISOString(), orderId: 'ORD-B2B-003', crop: 'Potato (Agra)', quantity: 1000, supplier: 'H.K. Farms', amount: 11500, status: 'PAID' },
    { id: 'INV-B2B005', date: new Date(Date.now() - 259200000).toISOString(), orderId: 'ORD-B2B-005', crop: 'Basmati Rice', quantity: 300, supplier: 'Venkat Agri', amount: 15600, status: 'PAID' },
    { id: 'INV-B2B006', date: new Date(Date.now() - 864000000).toISOString(), orderId: 'ORD-B2B-006', crop: 'Green Chili', quantity: 50, supplier: 'Sunita Farm', amount: 2250, status: 'PAID' },
  ];

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const crops = Array.from(new Set(invoices.map(i => i.crop)));
  const months = Array.from(new Set(invoices.map(i => {
    const d = new Date(i.date);
    return `${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`;
  })));

  let filtered = invoices;
  if (cropFilter !== 'All Crops') filtered = filtered.filter(i => i.crop === cropFilter);
  if (monthFilter !== 'All') filtered = filtered.filter(i => {
    const d = new Date(i.date);
    return `${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}` === monthFilter;
  });

  const totalAmount = filtered.reduce((s, i) => s + i.amount, 0);

  const downloadPDF = (invoice: typeof invoices[0]) => {
    const html = `<html><head><title>Invoice ${invoice.id}</title><style>
      body{font-family:Arial;padding:40px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}
    </style></head><body>
    <h1>TAX INVOICE</h1><p>AgriConnect Marketplace</p>
    <p>Invoice #: ${invoice.id}</p><p>Date: ${new Date(invoice.date).toLocaleDateString('en-IN')}</p>
    <p>Bill To: Vikas Enterprises | GSTIN: 07AABCB1234M1Z5</p>
    <table><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
    <tr><td>${invoice.crop}</td><td>${invoice.quantity}kg</td><td>₹${(invoice.amount / invoice.quantity).toFixed(1)}/kg</td><td>₹${invoice.amount.toLocaleString()}</td></tr></table>
    <p><strong>Platform Commission: ₹0 (0%)</strong></p><p><strong>Total: ₹${invoice.amount.toLocaleString()}</strong></p>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const w = window.open(URL.createObjectURL(blob), '_blank');
    if (w) setTimeout(() => w.print(), 500);
  };

  const downloadAllCSV = () => {
    const header = 'Invoice ID,Date,Order Ref,Crop,Qty(kg),Supplier,Amount,Status\n';
    const rows = filtered.map(i => `${i.id},${new Date(i.date).toLocaleDateString()},${i.orderId},${i.crop},${i.quantity},${i.supplier},${i.amount},${i.status}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click();
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">📄 Invoices</h1>
          <p className="page-subtitle">View and download your billing history and tax invoices</p>
        </div>
        <button className="btn btn-outline" onClick={downloadAllCSV}>📥 Download All (CSV)</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <select className="input" style={{ width: '160px' }} value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
          <option>All</option>
          {months.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="input" style={{ width: '180px' }} value={cropFilter} onChange={e => setCropFilter(e.target.value)}>
          <option>All Crops</option>
          {crops.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              {['Date', 'Invoice #', 'Order Ref', 'Description', 'Supplier', 'Amount', 'Status', 'Action'].map(h => (
                <th key={h} style={{ textAlign: h === 'Amount' ? 'right' : 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem', color: '#64748b' }}>{new Date(inv.date).toLocaleDateString()}</td>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 500 }}>{inv.id}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>{inv.orderId}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{inv.quantity}kg {inv.crop}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{inv.supplier}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>₹{inv.amount.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span className={`badge ${inv.status === 'PAID' ? 'badge-green' : 'badge-red'}`}>{inv.status}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => downloadPDF(inv)} style={{ fontSize: '0.75rem' }}>📄 Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
        <span>{filtered.length} invoice{filtered.length !== 1 ? 's' : ''}</span>
        <span style={{ fontWeight: 600, color: '#0f172a' }}>Total: ₹{totalAmount.toLocaleString()}</span>
      </div>
    </div>
  );
}
