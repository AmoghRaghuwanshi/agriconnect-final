'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Package, Download, ChevronRight } from 'lucide-react';

export default function AdminOrders() {
  const [mounted, setMounted] = useState(false);
  const { orders } = useOrderStore();

  const demoOrders = [
    { id: 'ORD-2041', orderType: 'B2B', cropName: 'Wheat (Lokwan)', quantityKg: 500, totalAmount: 14000, orderStatus: 'DISPUTED', createdAt: new Date(Date.now() - 86400000).toISOString(), buyerName: 'Vikas Trading Co.', farmerName: 'Raju Patel', paymentStatus: 'PAID_ESCROW' },
    { id: 'ORD-2045', orderType: 'B2C', cropName: 'Fresh Tomatoes', quantityKg: 5, totalAmount: 75, orderStatus: 'DISPUTED', createdAt: new Date(Date.now() - 43200000).toISOString(), buyerName: 'Rahul Verma', farmerName: 'Suresh Kumar', paymentStatus: 'PAID' },
    { id: 'ORD-2046', orderType: 'B2B', cropName: 'Potato (Agra)', quantityKg: 1000, totalAmount: 11500, orderStatus: 'COMPLETED', createdAt: new Date(Date.now() - 172800000).toISOString(), buyerName: 'FreshMart Logistics', farmerName: 'Ramesh Patil', paymentStatus: 'SETTLED' },
    { id: 'ORD-2047', orderType: 'B2C', cropName: 'Green Chili', quantityKg: 2, totalAmount: 90, orderStatus: 'DELIVERED', createdAt: new Date(Date.now() - 21600000).toISOString(), buyerName: 'Anita Desai', farmerName: 'Venkat Rao', paymentStatus: 'PAID' },
    { id: 'ORD-2048', orderType: 'B2B', cropName: 'Basmati Rice', quantityKg: 800, totalAmount: 41600, orderStatus: 'CONFIRMED', createdAt: new Date(Date.now() - 7200000).toISOString(), buyerName: 'Metro Foods Pvt Ltd', farmerName: 'Harish Kumar', paymentStatus: 'PENDING' },
    { id: 'ORD-2049', orderType: 'B2C', cropName: 'Red Onion', quantityKg: 3, totalAmount: 54, orderStatus: 'PENDING', createdAt: new Date(Date.now() - 3600000).toISOString(), buyerName: 'Priya Sharma', farmerName: 'Sunita Devi', paymentStatus: 'PENDING' },
  ];

  const allOrders = [...demoOrders, ...orders.filter(o => !demoOrders.some(d => d.id === o.id)).map(o => ({
    id: o.id, orderType: o.orderType || 'B2C', cropName: o.cropName, quantityKg: o.quantityKg,
    totalAmount: o.totalAmount, orderStatus: o.orderStatus, createdAt: o.createdAt,
    buyerName: o.buyerName, farmerName: o.farmerName, paymentStatus: o.paymentStatus
  }))];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [viewOrder, setViewOrder] = useState<typeof demoOrders[0] | null>(null);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const filtered = allOrders.filter(order => {
    const matchesSearch = !searchTerm || order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || order.orderStatus === statusFilter;
    const matchesType = typeFilter === 'All Types' || order.orderType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const exportCSV = () => {
    const header = 'ID,Type,Crop,Qty(kg),Buyer,Farmer,Amount,Status,Date\n';
    const rows = filtered.map(o => `${o.id},${o.orderType},${o.cropName},${o.quantityKg},${o.buyerName},${o.farmerName},${o.totalAmount},${o.orderStatus},${new Date(o.createdAt).toLocaleDateString()}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title"><Package size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Orders</h1>
        <p className="page-subtitle">Monitor all orders across the platform</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search by ID, crop, buyer or farmer..." className="input" style={{ flex: 1, minWidth: '250px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select className="input" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All Status</option><option>PENDING</option><option>CONFIRMED</option><option>DELIVERED</option><option>COMPLETED</option><option>DISPUTED</option>
        </select>
        <select className="input" style={{ width: '150px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option>All Types</option><option>B2B</option><option>B2C</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              {['#ID', 'Type', 'Crop & Qty', 'Buyer', 'Farmer', 'Amount', 'Status', 'Date', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', background: order.orderStatus === 'DISPUTED' ? '#fff5f5' : 'transparent' }}>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b' }}>{order.id}</td>
                <td style={{ padding: '0.75rem 1rem' }}><span className={`badge ${order.orderType === 'B2B' ? 'badge-blue' : 'badge-amber'}`}>{order.orderType}</span></td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 500 }}>{order.cropName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.quantityKg}kg</div>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{order.buyerName}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{order.farmerName}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{order.totalAmount.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span className={`badge ${order.orderStatus === 'COMPLETED' ? 'badge-green' : order.orderStatus === 'DELIVERED' ? 'badge-blue' : order.orderStatus === 'DISPUTED' ? 'badge-red' : order.orderStatus === 'CONFIRMED' ? 'badge-blue' : 'badge-gray'}`}>{order.orderStatus}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}><button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => setViewOrder(order)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state-icon"><Package size={40} style={{ color: 'var(--text-muted)' }} /></div>
            <div className="empty-state-title">No orders found</div>
            <div className="empty-state-text">Try adjusting your filters</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-outline" onClick={exportCSV}><Download size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Export CSV</button>
      </div>

      {viewOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setViewOrder(null)}>
          <div className="card" style={{ padding: '2rem', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Order {viewOrder.id}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewOrder(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div><strong>Type:</strong> {viewOrder.orderType}</div>
              <div><strong>Status:</strong> <span className={`badge ${viewOrder.orderStatus === 'DISPUTED' ? 'badge-red' : 'badge-green'}`}>{viewOrder.orderStatus}</span></div>
              <div><strong>Crop:</strong> {viewOrder.cropName}</div>
              <div><strong>Quantity:</strong> {viewOrder.quantityKg}kg</div>
              <div><strong>Amount:</strong> ₹{viewOrder.totalAmount.toLocaleString()}</div>
              <div><strong>Payment:</strong> {viewOrder.paymentStatus}</div>
              <div><strong>Buyer:</strong> {viewOrder.buyerName}</div>
              <div><strong>Farmer:</strong> {viewOrder.farmerName}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Date:</strong> {new Date(viewOrder.createdAt).toLocaleString()}</div>
            </div>
            {viewOrder.orderStatus === 'DISPUTED' && (
              <Link href="/admin/support" className="btn btn-primary" style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}>
                Go to Dispute Resolver <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
