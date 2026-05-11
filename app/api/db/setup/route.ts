import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }

  const sql = neon(databaseUrl);

  try {
    // ── Drop all tables for clean state ──────────────────────────────
    await sql`DROP TABLE IF EXISTS cart_items CASCADE`;
    await sql`DROP TABLE IF EXISTS orders CASCADE`;
    await sql`DROP TABLE IF EXISTS listings CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    // ── Users ────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        password TEXT DEFAULT '',
        role TEXT NOT NULL DEFAULT 'CONSUMER',
        avatar TEXT,
        location TEXT,
        state TEXT,
        farm_name TEXT,
        business_name TEXT,
        accuracy NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // ── Listings ─────────────────────────────────────────────────────
    await sql`
      CREATE TABLE listings (
        id TEXT PRIMARY KEY,
        farmer_id TEXT NOT NULL REFERENCES users(id),
        farmer_name TEXT NOT NULL,
        farm_name TEXT,
        crop_name TEXT NOT NULL,
        variety TEXT DEFAULT '',
        category TEXT DEFAULT 'Vegetables',
        quantity_kg NUMERIC NOT NULL,
        quantity_remaining NUMERIC NOT NULL,
        price_per_kg NUMERIC NOT NULL,
        min_order_kg NUMERIC DEFAULT 1,
        harvest_date TEXT,
        storage_type TEXT,
        description TEXT,
        images TEXT[] DEFAULT '{}',
        status TEXT DEFAULT 'ACTIVE',
        is_b2b BOOLEAN DEFAULT true,
        is_b2c BOOLEAN DEFAULT true,
        expires_at TEXT,
        location TEXT,
        state TEXT,
        organic BOOLEAN DEFAULT false,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // ── Orders ───────────────────────────────────────────────────────
    await sql`
      CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        buyer_id TEXT NOT NULL REFERENCES users(id),
        buyer_name TEXT NOT NULL,
        farmer_id TEXT NOT NULL REFERENCES users(id),
        farmer_name TEXT NOT NULL,
        farm_name TEXT,
        listing_id TEXT,
        crop_name TEXT NOT NULL,
        order_type TEXT DEFAULT 'B2C',
        quantity_kg NUMERIC NOT NULL,
        received_kg NUMERIC,
        price_per_kg NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        order_status TEXT DEFAULT 'PENDING',
        payment_status TEXT DEFAULT 'PENDING',
        payment_method TEXT,
        delivery_address JSONB DEFAULT '{}',
        review JSONB,
        dispute_reason TEXT,
        dispute_raised_at TEXT,
        confirmed_at TEXT,
        out_for_delivery_at TEXT,
        delivered_at TEXT,
        completed_at TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // ── Cart Items ───────────────────────────────────────────────────
    await sql`
      CREATE TABLE cart_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        listing_id TEXT NOT NULL,
        quantity_kg NUMERIC NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // ── Seed users (one by one to avoid parameter issues) ────────────
    const users = [
      { id: 'demo-farmer-001', name: 'Raju Patel', email: 'raju@demo.agriconnect.app', phone: '+919123456780', password: 'demo123', role: 'FARMER', avatar: '👨‍🌾', location: 'Indore, MP', state: 'Madhya Pradesh', farm_name: 'Patel Organic Farm', business_name: '', accuracy: 94 },
      { id: 'demo-farmer-002', name: 'Suresh Kumar', email: 'suresh@demo.agriconnect.app', phone: '+919111222333', password: 'demo123', role: 'FARMER', avatar: '👨‍🌾', location: 'Nashik, MH', state: 'Maharashtra', farm_name: 'Kumar Fresh Farms', business_name: '', accuracy: 88 },
      { id: 'demo-farmer-003', name: 'Ramesh Patil', email: 'ramesh@demo.agriconnect.app', phone: '+919444555666', password: 'demo123', role: 'FARMER', avatar: '👨‍🌾', location: 'Agra, UP', state: 'Uttar Pradesh', farm_name: 'Patil Agro', business_name: '', accuracy: 91 },
      { id: 'demo-farmer-004', name: 'Venkat Rao', email: 'venkat@demo.agriconnect.app', phone: '+919777888999', password: 'demo123', role: 'FARMER', avatar: '👨‍🌾', location: 'Guntur, AP', state: 'Andhra Pradesh', farm_name: 'Rao Spice Farm', business_name: '', accuracy: 96 },
      { id: 'demo-farmer-005', name: 'Dilip Sahu', email: 'dilip@demo.agriconnect.app', phone: '+919222333444', password: 'demo123', role: 'FARMER', avatar: '👨‍🌾', location: 'Patna, BR', state: 'Bihar', farm_name: 'Sahu Grains', business_name: '', accuracy: 85 },
      { id: 'demo-farmer-006', name: 'Nagaraju Reddy', email: 'nagaraju@demo.agriconnect.app', phone: '+919333444555', password: 'demo123', role: 'FARMER', avatar: '👨‍🌾', location: 'Nizamabad, TS', state: 'Telangana', farm_name: 'Reddy Turmeric Farm', business_name: '', accuracy: 93 },
      { id: 'demo-consumer-001', name: 'Priya Sharma', email: 'priya@demo.agriconnect.app', phone: '+919876543210', password: 'demo123', role: 'CONSUMER', avatar: '👩', location: 'Bhopal, MP', state: 'Madhya Pradesh', farm_name: '', business_name: '', accuracy: 0 },
      { id: 'demo-wholesaler-001', name: 'Rajesh Agarwal', email: 'rajesh@demo.agriconnect.app', phone: '+919988776655', password: 'demo123', role: 'WHOLESALER', avatar: '🏭', location: 'Indore, MP', state: 'Madhya Pradesh', farm_name: '', business_name: 'Rajdhani Agro Traders Pvt Ltd', accuracy: 0 },
      { id: 'demo-admin-001', name: 'Admin', email: 'admin@agriconnect.app', phone: '+919000000000', password: 'admin123', role: 'ADMIN', avatar: '⚙️', location: 'Bangalore, KA', state: 'Karnataka', farm_name: '', business_name: '', accuracy: 0 },
    ];

    for (const u of users) {
      await sql`INSERT INTO users (id,name,email,phone,password,role,avatar,location,state,farm_name,business_name,accuracy) VALUES (${u.id},${u.name},${u.email},${u.phone},${u.password},${u.role},${u.avatar},${u.location},${u.state},${u.farm_name},${u.business_name},${u.accuracy}) ON CONFLICT (id) DO NOTHING`;
    }

    // ── Seed listings (one by one) ───────────────────────────────────
    const listings = [
      { id:'L001',fid:'demo-farmer-001',fn:'Raju Patel',fm:'Patel Organic Farm',cn:'Wheat (Lokwan)',v:'Lokwan',cat:'Grains',q:500,qr:500,p:28,mo:10,hd:'2026-05-01',st:'Dry warehouse',desc:'Grade A, machine-cleaned premium wheat',s:'ACTIVE',b2b:true,b2c:true,ea:'2026-05-15T00:00:00Z',loc:'Indore, MP',state:'Madhya Pradesh',org:false,views:47 },
      { id:'L002',fid:'demo-farmer-001',fn:'Raju Patel',fm:'Patel Organic Farm',cn:'Basmati Rice',v:'Pusa 1121',cat:'Grains',q:1000,qr:1000,p:55,mo:25,hd:'2026-04-28',st:'Cold storage',desc:'Premium long-grain basmati',s:'ACTIVE',b2b:true,b2c:true,ea:'2026-05-20T00:00:00Z',loc:'Indore, MP',state:'Madhya Pradesh',org:false,views:89 },
      { id:'L003',fid:'demo-farmer-001',fn:'Raju Patel',fm:'Patel Organic Farm',cn:'Onion (Red)',v:'Nashik Red',cat:'Vegetables',q:200,qr:0,p:18,mo:20,hd:'2026-04-20',st:'Field-fresh',desc:'Fresh red onion, sorted',s:'EXPIRED',b2b:true,b2c:true,ea:'2026-05-05T00:00:00Z',loc:'Indore, MP',state:'Madhya Pradesh',org:false,views:122 },
      { id:'L004',fid:'demo-farmer-002',fn:'Suresh Kumar',fm:'Kumar Fresh Farms',cn:'Fresh Tomatoes',v:'Hybrid',cat:'Vegetables',q:200,qr:200,p:15,mo:5,hd:'2026-05-06',st:'Field-fresh',desc:'Vine-ripened, chemical-free tomatoes',s:'ACTIVE',b2b:false,b2c:true,ea:'2026-05-13T00:00:00Z',loc:'Nashik, MH',state:'Maharashtra',org:false,views:63 },
      { id:'L005',fid:'demo-farmer-003',fn:'Ramesh Patil',fm:'Patil Agro',cn:'Potato (Agra)',v:'Kufri Jyoti',cat:'Vegetables',q:2000,qr:2000,p:12,mo:50,hd:'2026-04-25',st:'Cold storage',desc:'Cold-stored A-grade potatoes',s:'ACTIVE',b2b:true,b2c:true,ea:'2026-05-25T00:00:00Z',loc:'Agra, UP',state:'Uttar Pradesh',org:false,views:156 },
      { id:'L006',fid:'demo-farmer-004',fn:'Venkat Rao',fm:'Rao Spice Farm',cn:'Green Chili',v:'Guntur Sannam',cat:'Spices',q:100,qr:100,p:45,mo:2,hd:'2026-05-04',st:'Field-fresh',desc:'Extremely spicy Guntur chili',s:'ACTIVE',b2b:true,b2c:true,ea:'2026-05-18T00:00:00Z',loc:'Guntur, AP',state:'Andhra Pradesh',org:false,views:34 },
      { id:'L007',fid:'demo-farmer-005',fn:'Dilip Sahu',fm:'Sahu Grains',cn:'Maize (Yellow)',v:'Pioneer',cat:'Grains',q:3000,qr:3000,p:22,mo:100,hd:'2026-04-30',st:'Dry warehouse',desc:'Feed-grade yellow maize',s:'ACTIVE',b2b:true,b2c:false,ea:'2026-05-30T00:00:00Z',loc:'Patna, BR',state:'Bihar',org:false,views:78 },
      { id:'L008',fid:'demo-farmer-006',fn:'Nagaraju Reddy',fm:'Reddy Turmeric Farm',cn:'Fresh Turmeric',v:'Salem',cat:'Spices',q:150,qr:150,p:85,mo:5,hd:'2026-05-02',st:'Dry warehouse',desc:'High-curcumin organic turmeric',s:'ACTIVE',b2b:true,b2c:true,ea:'2026-05-16T00:00:00Z',loc:'Nizamabad, TS',state:'Telangana',org:true,views:42 },
    ];

    for (const l of listings) {
      await sql`INSERT INTO listings (id,farmer_id,farmer_name,farm_name,crop_name,variety,category,quantity_kg,quantity_remaining,price_per_kg,min_order_kg,harvest_date,storage_type,description,status,is_b2b,is_b2c,expires_at,location,state,organic,views) VALUES (${l.id},${l.fid},${l.fn},${l.fm},${l.cn},${l.v},${l.cat},${l.q},${l.qr},${l.p},${l.mo},${l.hd},${l.st},${l.desc},${l.s},${l.b2b},${l.b2c},${l.ea},${l.loc},${l.state},${l.org},${l.views}) ON CONFLICT (id) DO NOTHING`;
    }

    // ── Seed orders (one by one) ─────────────────────────────────────
    const now = Date.now();
    const ago = (days: number) => new Date(now - days * 86400000).toISOString();

    const orders = [
      { id:'ORD-2041',bi:'demo-consumer-001',bn:'Priya Sharma',fi:'demo-farmer-001',fn:'Raju Patel',fm:'Patel Organic Farm',li:'L001',cn:'Wheat (Lokwan)',ot:'B2C',q:25,rk:null as number|null,p:28,ta:700,os:'PENDING',ps:'PAID',pm:'UPI',da:'{"label":"Home","line1":"123 MG Road","city":"Bhopal","state":"MP","pincode":"462001"}',rv:null as string|null,ca:null as string|null,ofd:null as string|null,del:null as string|null,comp:null as string|null,created:ago(1) },
      { id:'ORD-2038',bi:'demo-wholesaler-001',bn:'Rajesh Agarwal',fi:'demo-farmer-001',fn:'Raju Patel',fm:'Patel Organic Farm',li:'L002',cn:'Basmati Rice',ot:'B2B',q:100,rk:null,p:55,ta:5500,os:'OUT_FOR_DELIVERY',ps:'PAID',pm:'Credit',da:'{"label":"Warehouse","line1":"Plot 45 Industrial Area","city":"Indore","state":"MP","pincode":"452001"}',rv:null,ca:ago(2),ofd:ago(1),del:null,comp:null,created:ago(3) },
      { id:'ORD-2035',bi:'demo-consumer-001',bn:'Priya Sharma',fi:'demo-farmer-001',fn:'Raju Patel',fm:'Patel Organic Farm',li:'L003',cn:'Onion (Red)',ot:'B2C',q:50,rk:48,p:18,ta:900,os:'COMPLETED',ps:'PAID',pm:'UPI',da:'{"label":"Home","line1":"123 MG Road","city":"Bhopal","state":"MP","pincode":"462001"}',rv:'{"rating":5,"comment":"Very fresh onions, accurate quantity!","createdAt":"2026-05-05"}',ca:ago(5),ofd:ago(4),del:ago(3),comp:ago(2),created:ago(6) },
      { id:'ORD-2032',bi:'demo-consumer-001',bn:'Priya Sharma',fi:'demo-farmer-004',fn:'Venkat Rao',fm:'Rao Spice Farm',li:'L006',cn:'Green Chili',ot:'B2C',q:5,rk:5,p:45,ta:225,os:'DELIVERED',ps:'PAID',pm:'UPI',da:'{"label":"Home","line1":"123 MG Road","city":"Bhopal","state":"MP","pincode":"462001"}',rv:null,ca:ago(7),ofd:ago(6),del:ago(5),comp:null,created:ago(8) },
      { id:'ORD-2029',bi:'demo-consumer-001',bn:'Priya Sharma',fi:'demo-farmer-002',fn:'Suresh Kumar',fm:'Kumar Fresh Farms',li:'L004',cn:'Fresh Tomatoes',ot:'B2C',q:10,rk:10,p:15,ta:150,os:'COMPLETED',ps:'PAID',pm:'UPI',da:'{"label":"Home","line1":"123 MG Road","city":"Bhopal","state":"MP","pincode":"462001"}',rv:'{"rating":4,"comment":"Good tomatoes, slightly soft","createdAt":"2026-05-01"}',ca:ago(9),ofd:ago(8),del:ago(7),comp:ago(6),created:ago(10) },
      { id:'ORD-2026',bi:'demo-wholesaler-001',bn:'Rajesh Agarwal',fi:'demo-farmer-005',fn:'Dilip Sahu',fm:'Sahu Grains',li:'L007',cn:'Maize (Yellow)',ot:'B2B',q:500,rk:490,p:22,ta:11000,os:'COMPLETED',ps:'PAID',pm:'Credit',da:'{"label":"Warehouse","line1":"Plot 45 Industrial Area","city":"Indore","state":"MP","pincode":"452001"}',rv:'{"rating":5,"comment":"Excellent quality maize","createdAt":"2026-04-27"}',ca:ago(13),ofd:ago(12),del:ago(11),comp:ago(10),created:ago(14) },
    ];

    for (const o of orders) {
      await sql`INSERT INTO orders (id,buyer_id,buyer_name,farmer_id,farmer_name,farm_name,listing_id,crop_name,order_type,quantity_kg,received_kg,price_per_kg,total_amount,order_status,payment_status,payment_method,delivery_address,review,confirmed_at,out_for_delivery_at,delivered_at,completed_at,created_at) VALUES (${o.id},${o.bi},${o.bn},${o.fi},${o.fn},${o.fm},${o.li},${o.cn},${o.ot},${o.q},${o.rk},${o.p},${o.ta},${o.os},${o.ps},${o.pm},${o.da}::jsonb,${o.rv}::jsonb,${o.ca},${o.ofd},${o.del},${o.comp},${o.created}) ON CONFLICT (id) DO NOTHING`;
    }

    // ── Verify ───────────────────────────────────────────────────────
    const counts = await sql`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM listings) as listings,
        (SELECT COUNT(*) FROM orders) as orders
    `;

    return NextResponse.json({
      success: true,
      message: 'Database fully initialized!',
      tables: {
        users: Number(counts[0].users),
        listings: Number(counts[0].listings),
        orders: Number(counts[0].orders),
      },
    });
  } catch (error) {
    console.error('[db/setup] Error:', error);
    return NextResponse.json({ error: 'Setup failed', details: String(error) }, { status: 500 });
  }
}
