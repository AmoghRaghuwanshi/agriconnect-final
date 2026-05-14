'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalytics() {
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState('Last 6 months');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const monthlyData = [
    { name: 'Jan', revenue: 400000, b2c: 120, b2b: 40 },
    { name: 'Feb', revenue: 300000, b2c: 150, b2b: 35 },
    { name: 'Mar', revenue: 550000, b2c: 200, b2b: 55 },
    { name: 'Apr', revenue: 700000, b2c: 280, b2b: 70 },
    { name: 'May', revenue: 650000, b2c: 310, b2b: 65 },
    { name: 'Jun', revenue: 900000, b2c: 400, b2b: 90 },
  ];

  const statusData = [
    { name: 'Completed', value: 680 },
    { name: 'In Transit', value: 85 },
    { name: 'Pending', value: 45 },
    { name: 'Disputed', value: 12 },
    { name: 'Cancelled', value: 28 },
  ];

  const topCrops = [
    { name: 'Wheat', orders: 400 },
    { name: 'Potato', orders: 320 },
    { name: 'Onion', orders: 280 },
    { name: 'Rice', orders: 250 },
    { name: 'Tomato', orders: 200 },
  ];

  const stateData = [
    { state: 'Madhya Pradesh', orders: 285, revenue: '₹8.2L' },
    { state: 'Maharashtra', orders: 240, revenue: '₹7.1L' },
    { state: 'Uttar Pradesh', orders: 195, revenue: '₹5.8L' },
    { state: 'Karnataka', orders: 120, revenue: '₹3.5L' },
    { state: 'Punjab', orders: 95, revenue: '₹3.1L' },
  ];

  const topFarmers = [
    { rank: 1, name: 'Raju Farms', state: 'MP', orders: 18, revenue: '₹42,000' },
    { rank: 2, name: 'H.K. Farms', state: 'UP', orders: 15, revenue: '₹35,500' },
    { rank: 3, name: 'Kumar Organic', state: 'MH', orders: 12, revenue: '₹28,500' },
    { rank: 4, name: 'Venkat Agri', state: 'KA', orders: 8, revenue: '₹18,000' },
    { rank: 5, name: 'Sunita Farm', state: 'UP', orders: 5, revenue: '₹12,000' },
  ];

  const topBuyers = [
    { rank: 1, name: 'Vikas Trading Co.', type: 'Wholesaler', orders: 8, spend: '₹1,04,000' },
    { rank: 2, name: 'FreshMart Logistics', type: 'Wholesaler', orders: 5, spend: '₹62,000' },
    { rank: 3, name: 'Metro Foods', type: 'Wholesaler', orders: 4, spend: '₹48,000' },
    { rank: 4, name: 'Rahul Verma', type: 'Consumer', orders: 12, spend: '₹3,200' },
    { rank: 5, name: 'Priya Sharma', type: 'Consumer', orders: 10, spend: '₹2,800' },
  ];

  const STATUS_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#94a3b8'];

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title"><BarChart3 size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Analytics Dashboard</h1>
          <p className="page-subtitle">Platform metrics and performance overview</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['Last 7 days', 'Last 30 days', 'Last 6 months'].map(r => (
            <button key={r} className={`btn btn-sm ${dateRange === r ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.8rem' }} onClick={() => setDateRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total GMV (YTD)', value: '₹35.0L', trend: '+12% vs last year', color: '#10b981' },
          { label: 'Platform Revenue', value: '₹70.0K', trend: '+15% vs last year', color: '#3b82f6' },
          { label: 'Active Users', value: '1,460', trend: '+8% this month', color: '#8b5cf6' },
          { label: 'Dispute Rate', value: '1.2%', trend: '-0.3% this month', color: '#f59e0b' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${k.color}` }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{k.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginTop: '0.4rem' }}>{k.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.2rem' }}>{k.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Revenue Over Time</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="#4338ca" fill="#c7d2fe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Orders by Status</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusData.map((_, i) => <Cell key={`c-${i}`} fill={STATUS_COLORS[i]} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Top Crops by Orders</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCrops} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80} />
                <RechartsTooltip />
                <Bar dataKey="orders" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>B2C vs B2B Orders</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="b2c" stackId="a" fill="#3b82f6" name="B2C" radius={[0, 0, 0, 0]} />
                <Bar dataKey="b2b" stackId="a" fill="#8b5cf6" name="B2B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>State-wise Order Distribution</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              {['State', 'Orders', 'Revenue'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stateData.map(s => (
              <tr key={s.state} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.6rem 1rem', fontWeight: 500 }}>{s.state}</td>
                <td style={{ padding: '0.6rem 1rem' }}>{s.orders}</td>
                <td style={{ padding: '0.6rem 1rem', fontWeight: 600, color: '#059669' }}>{s.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Top Farmers by Revenue</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Rank', 'Farmer', 'State', 'Orders', 'Revenue'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topFarmers.map(f => (
                <tr key={f.rank} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: f.rank <= 3 ? '#d97706' : '#64748b' }}>#{f.rank}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 500 }}>{f.name}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>{f.state}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>{f.orders}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#059669' }}>{f.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Top Buyers</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Rank', 'Buyer', 'Type', 'Orders', 'Spend'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topBuyers.map(b => (
                <tr key={b.rank} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: b.rank <= 3 ? '#d97706' : '#64748b' }}>#{b.rank}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 500 }}>{b.name}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}><span className={`badge badge-${b.type === 'Wholesaler' ? 'blue' : 'olive'}`} style={{ fontSize: '0.7rem' }}>{b.type}</span></td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>{b.orders}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#059669' }}>{b.spend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
