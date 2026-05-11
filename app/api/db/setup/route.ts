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
    // ── Drop and recreate for clean state ────────────────────────────
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

    // ── Seed demo users ──────────────────────────────────────────────
    await sql`
      INSERT INTO users (id, name, email, phone, password, role, avatar, location, farm_name, business_name, accuracy) VALUES
        ('demo-farmer-001', 'Raju Patel', 'raju@demo.agriconnect.app', '+919123456780', 'demo123', 'FARMER', '👨‍🌾', 'Indore, MP', 'Patel Organic Farm', NULL, 94),
        ('demo-farmer-002', 'Suresh Kumar', 'suresh@demo.agriconnect.app', '+919111222333', 'demo123', 'FARMER', '👨‍🌾', 'Nashik, MH', 'Kumar Fresh Farms', NULL, 88),
        ('demo-farmer-003', 'Ramesh Patil', 'ramesh@demo.agriconnect.app', '+919444555666', 'demo123', 'FARMER', '👨‍🌾', 'Agra, UP', 'Patil Agro', NULL, 91),
        ('demo-farmer-004', 'Venkat Rao', 'venkat@demo.agriconnect.app', '+919777888999', 'demo123', 'FARMER', '👨‍🌾', 'Guntur, AP', 'Rao Spice Farm', NULL, 96),
        ('demo-farmer-005', 'Dilip Sahu', 'dilip@demo.agriconnect.app', '+919222333444', 'demo123', 'FARMER', '👨‍🌾', 'Patna, BR', 'Sahu Grains', NULL, 85),
        ('demo-farmer-006', 'Nagaraju Reddy', 'nagaraju@demo.agriconnect.app', '+919333444555', 'demo123', 'FARMER', '👨‍🌾', 'Nizamabad, TS', 'Reddy Turmeric Farm', NULL, 93),
        ('demo-consumer-001', 'Priya Sharma', 'priya@demo.agriconnect.app', '+919876543210', 'demo123', 'CONSUMER', '👩', 'Bhopal, MP', NULL, NULL, 0),
        ('demo-wholesaler-001', 'Rajesh Agarwal', 'rajesh@demo.agriconnect.app', '+919988776655', 'demo123', 'WHOLESALER', '🏭', 'Indore, MP', NULL, 'Rajdhani Agro Traders Pvt Ltd', 0),
        ('demo-admin-001', 'Admin', 'admin@agriconnect.app', '+919000000000', 'admin123', 'ADMIN', '⚙️', 'Bangalore, KA', NULL, NULL, 0)
    `;

    // ── Seed listings (matches listingStore seeds) ───────────────────
    await sql`
      INSERT INTO listings (id, farmer_id, farmer_name, farm_name, crop_name, variety, category, quantity_kg, quantity_remaining, price_per_kg, min_order_kg, harvest_date, storage_type, description, status, is_b2b, is_b2c, expires_at, location, state, organic, views) VALUES
        ('L001', 'demo-farmer-001', 'Raju Patel', 'Patel Organic Farm', 'Wheat (Lokwan)', 'Lokwan', 'Grains', 500, 500, 28, 10, '2026-05-01', 'Dry warehouse', 'Grade A, machine-cleaned premium wheat', 'ACTIVE', true, true, '2026-05-15T00:00:00Z', 'Indore, MP', 'Madhya Pradesh', false, 47),
        ('L002', 'demo-farmer-001', 'Raju Patel', 'Patel Organic Farm', 'Basmati Rice', 'Pusa 1121', 'Grains', 1000, 1000, 55, 25, '2026-04-28', 'Cold storage', 'Premium long-grain basmati', 'ACTIVE', true, true, '2026-05-20T00:00:00Z', 'Indore, MP', 'Madhya Pradesh', false, 89),
        ('L003', 'demo-farmer-001', 'Raju Patel', 'Patel Organic Farm', 'Onion (Red)', 'Nashik Red', 'Vegetables', 200, 0, 18, 20, '2026-04-20', 'Field-fresh', 'Fresh red onion, sorted', 'EXPIRED', true, true, '2026-05-05T00:00:00Z', 'Indore, MP', 'Madhya Pradesh', false, 122),
        ('L004', 'demo-farmer-002', 'Suresh Kumar', 'Kumar Fresh Farms', 'Fresh Tomatoes', 'Hybrid', 'Vegetables', 200, 200, 15, 5, '2026-05-06', 'Field-fresh', 'Vine-ripened, chemical-free tomatoes', 'ACTIVE', false, true, '2026-05-13T00:00:00Z', 'Nashik, MH', 'Maharashtra', false, 63),
        ('L005', 'demo-farmer-003', 'Ramesh Patil', 'Patil Agro', 'Potato (Agra)', 'Kufri Jyoti', 'Vegetables', 2000, 2000, 12, 50, '2026-04-25', 'Cold storage', 'Cold-stored A-grade potatoes', 'ACTIVE', true, true, '2026-05-25T00:00:00Z', 'Agra, UP', 'Uttar Pradesh', false, 156),
        ('L006', 'demo-farmer-004', 'Venkat Rao', 'Rao Spice Farm', 'Green Chili', 'Guntur Sannam', 'Spices', 100, 100, 45, 2, '2026-05-04', 'Field-fresh', 'Extremely spicy Guntur chili', 'ACTIVE', true, true, '2026-05-18T00:00:00Z', 'Guntur, AP', 'Andhra Pradesh', false, 34),
        ('L007', 'demo-farmer-005', 'Dilip Sahu', 'Sahu Grains', 'Maize (Yellow)', 'Pioneer', 'Grains', 3000, 3000, 22, 100, '2026-04-30', 'Dry warehouse', 'Feed-grade yellow maize', 'ACTIVE', true, false, '2026-05-30T00:00:00Z', 'Patna, BR', 'Bihar', false, 78),
        ('L008', 'demo-farmer-006', 'Nagaraju Reddy', 'Reddy Turmeric Farm', 'Fresh Turmeric', 'Salem', 'Spices', 150, 150, 85, 5, '2026-05-02', 'Dry warehouse', 'High-curcumin organic turmeric', 'ACTIVE', true, true, '2026-05-16T00:00:00Z', 'Nizamabad, TS', 'Telangana', true, 42)
    `;

    // ── Seed orders ──────────────────────────────────────────────────
    const now = new Date();
    const ago = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

    await sql`
      INSERT INTO orders (id, buyer_id, buyer_name, farmer_id, farmer_name, farm_name, listing_id, crop_name, order_type, quantity_kg, received_kg, price_per_kg, total_amount, order_status, payment_status, payment_method, delivery_address, review, confirmed_at, out_for_delivery_at, delivered_at, completed_at, created_at) VALUES
        ('ORD-2041', 'demo-consumer-001', 'Priya Sharma', 'demo-farmer-001', 'Raju Patel', 'Patel Organic Farm', 'L001', 'Wheat (Lokwan)', 'B2C', 25, NULL, 28, 700, 'PENDING', 'PAID', 'UPI', '{"label":"Home","line1":"123 MG Road","city":"Bhopal","state":"MP","pincode":"462001"}', NULL, NULL, NULL, NULL, NULL, ${ago(1)}),
        ('ORD-2038', 'demo-wholesaler-001', 'Rajesh Agarwal', 'demo-farmer-001', 'Raju Patel', 'Patel Organic Farm', 'L002', 'Basmati Rice', 'B2B', 100, NULL, 55, 5500, 'OUT_FOR_DELIVERY', 'PAID', 'Credit', '{"label":"Warehouse","line1":"Plot 45 Industrial Area","city":"Indore","state":"MP","pincode":"452001"}', NULL, ${ago(2)}, ${ago(1)}, NULL, NULL, ${ago(3)}),
        ('ORD-2035', 'demo-consumer-001', 'Priya Sharma', 'demo-farmer-001', 'Raju Patel', 'Patel Organic Farm', 'L003', 'Onion (Red)', 'B2C', 50, 48, 18, 900, 'COMPLETED', 'PAID', 'UPI', '{"label":"Home","line1":"123 MG Road","city":"Bhopal","state":"MP","pincode":"462001"}', '{"rating":5,"comment":"Very fresh onions, accurate quantity!","createdAt":"${ago(2)}"}', ${ago(5)}, ${ago(4)}, ${ago(3)}, ${ago(2)}, ${ago(6)}),
        ('ORD-2032', 'demo-consumer-001', 'Priya Sharma', 'demo-farmer-004', 'Venkat Rao', 'Rao Spice Farm', 'L006', 'Green Chili', 'B2C', 5, 5, 45, 225, 'DELIVERED', 'PAID', 'UPI', '{"label":"Home","line1":"123 MG Road","city":"Bhopal","state":"MP","pincode":"462001"}', NULL, ${ago(7)}, ${ago(6)}, ${ago(5)}, NULL, ${ago(8)}),
        ('ORD-2029', 'demo-consumer-001', 'Priya Sharma', 'demo-farmer-002', 'Suresh Kumar', 'Kumar Fresh Farms', 'L004', 'Fresh Tomatoes', 'B2C', 10, 10, 15, 150, 'COMPLETED', 'PAID', 'UPI', '{"label":"Home","line1":"123 MG Road","city":"Bhopal","state":"MP","pincode":"462001"}', '{"rating":4,"comment":"Good tomatoes, slightly soft","createdAt":"${ago(6)}"}', ${ago(9)}, ${ago(8)}, ${ago(7)}, ${ago(6)}, ${ago(10)}),
        ('ORD-2026', 'demo-wholesaler-001', 'Rajesh Agarwal', 'demo-farmer-005', 'Dilip Sahu', 'Sahu Grains', 'L007', 'Maize (Yellow)', 'B2B', 500, 490, 22, 11000, 'COMPLETED', 'PAID', 'Credit', '{"label":"Warehouse","line1":"Plot 45 Industrial Area","city":"Indore","state":"MP","pincode":"452001"}', '{"rating":5,"comment":"Excellent quality maize, good packaging","createdAt":"${ago(10)}"}', ${ago(13)}, ${ago(12)}, ${ago(11)}, ${ago(10)}, ${ago(14)})
    `;

    const counts = await sql`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM listings) as listings,
        (SELECT COUNT(*) FROM orders) as orders
    `;

    return NextResponse.json({
      success: true,
      message: 'Database fully initialized with demo data!',
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
