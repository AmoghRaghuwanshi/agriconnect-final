import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

/**
 * GET /api/db/setup — Creates tables + seeds demo data into Neon.
 * Call this ONCE to initialize the database.
 */
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }

  const sql = neon(databaseUrl);

  try {
    // ── Create tables ──────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'CONSUMER',
        avatar TEXT,
        location TEXT,
        farm_name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        farmer_id TEXT NOT NULL REFERENCES users(id),
        crop_name TEXT NOT NULL,
        category TEXT DEFAULT 'Vegetables',
        price_per_kg NUMERIC NOT NULL,
        quantity_kg NUMERIC NOT NULL,
        min_order_kg NUMERIC DEFAULT 1,
        unit TEXT DEFAULT 'kg',
        description TEXT,
        image_url TEXT,
        is_organic BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'active',
        location TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        buyer_id TEXT NOT NULL REFERENCES users(id),
        farmer_id TEXT NOT NULL REFERENCES users(id),
        listing_id TEXT REFERENCES listings(id),
        crop_name TEXT NOT NULL,
        quantity_kg NUMERIC NOT NULL,
        total_price NUMERIC NOT NULL,
        status TEXT DEFAULT 'confirmed',
        payment_method TEXT DEFAULT 'cod',
        delivery_address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        listing_id TEXT NOT NULL REFERENCES listings(id),
        quantity_kg NUMERIC NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // ── Seed demo users ────────────────────────────────────────────────
    await sql`
      INSERT INTO users (id, name, email, phone, role, location, farm_name) VALUES
        ('farmer-raju-001', 'Raju Patel', 'raju@agriconnect.app', '+919876543210', 'FARMER', 'Nashik, Maharashtra', 'Patel Organic Farm'),
        ('consumer-priya-001', 'Priya Sharma', 'priya@agriconnect.app', '+919123456780', 'CONSUMER', 'Mumbai, Maharashtra', NULL),
        ('wholesaler-vikram-001', 'Vikram Wholesale', 'vikram@agriconnect.app', '+919988776655', 'WHOLESALER', 'Delhi NCR', NULL),
        ('admin-001', 'Admin', 'admin@agriconnect.app', '+919000000000', 'ADMIN', 'Bangalore, Karnataka', NULL)
      ON CONFLICT (id) DO NOTHING
    `;

    // ── Seed demo listings ─────────────────────────────────────────────
    await sql`
      INSERT INTO listings (id, farmer_id, crop_name, category, price_per_kg, quantity_kg, min_order_kg, unit, description, image_url, is_organic, status, location) VALUES
        ('listing-001', 'farmer-raju-001', 'Onion (Nashik Red)', 'Vegetables', 30, 500, 5, 'kg', 'Premium Nashik red onions, freshly harvested from organic farms.', '/images/onion.png', true, 'active', 'Nashik, Maharashtra'),
        ('listing-002', 'farmer-raju-001', 'Tomato (Hybrid)', 'Vegetables', 45, 300, 2, 'kg', 'Fresh hybrid tomatoes, vine-ripened for maximum flavor.', '/images/tomato.png', false, 'active', 'Nashik, Maharashtra'),
        ('listing-003', 'farmer-raju-001', 'Basmati Rice', 'Grains', 85, 1000, 10, 'kg', 'Aged basmati rice, long grain premium quality.', '/images/rice.png', true, 'active', 'Nashik, Maharashtra'),
        ('listing-004', 'farmer-raju-001', 'Turmeric (Lakadong)', 'Spices', 120, 200, 1, 'kg', 'High-curcumin Lakadong turmeric from organic cultivation.', '/images/turmeric.png', true, 'active', 'Nashik, Maharashtra'),
        ('listing-005', 'farmer-raju-001', 'Green Chilli', 'Vegetables', 60, 150, 1, 'kg', 'Fresh green chillies, medium spice level.', '/images/chilli.png', false, 'active', 'Nashik, Maharashtra'),
        ('listing-006', 'farmer-raju-001', 'Alphonso Mango', 'Fruits', 350, 100, 2, 'kg', 'Premium Alphonso mangoes from Ratnagiri.', '/images/mango.png', true, 'active', 'Ratnagiri, Maharashtra'),
        ('listing-007', 'farmer-raju-001', 'Wheat (Sharbati)', 'Grains', 35, 2000, 25, 'kg', 'MP Sharbati wheat, golden grain premium quality.', '/images/wheat.png', false, 'active', 'Nashik, Maharashtra'),
        ('listing-008', 'farmer-raju-001', 'Potato (Agria)', 'Vegetables', 25, 800, 5, 'kg', 'Agria variety potatoes, perfect for cooking.', '/images/potato.png', false, 'active', 'Nashik, Maharashtra'),
        ('listing-009', 'farmer-raju-001', 'Coriander (Fresh)', 'Vegetables', 80, 50, 0.5, 'kg', 'Freshly cut coriander bunches.', '/images/coriander.png', true, 'active', 'Nashik, Maharashtra')
      ON CONFLICT (id) DO NOTHING
    `;

    // ── Seed demo orders ───────────────────────────────────────────────
    await sql`
      INSERT INTO orders (id, buyer_id, farmer_id, listing_id, crop_name, quantity_kg, total_price, status, payment_method, delivery_address) VALUES
        ('order-001', 'consumer-priya-001', 'farmer-raju-001', 'listing-001', 'Onion (Nashik Red)', 10, 300, 'delivered', 'online', 'Andheri West, Mumbai'),
        ('order-002', 'consumer-priya-001', 'farmer-raju-001', 'listing-002', 'Tomato (Hybrid)', 5, 225, 'shipped', 'cod', 'Andheri West, Mumbai'),
        ('order-003', 'wholesaler-vikram-001', 'farmer-raju-001', 'listing-003', 'Basmati Rice', 100, 8500, 'confirmed', 'online', 'Azadpur Mandi, Delhi'),
        ('order-004', 'consumer-priya-001', 'farmer-raju-001', 'listing-004', 'Turmeric (Lakadong)', 2, 240, 'confirmed', 'online', 'Bandra, Mumbai'),
        ('order-005', 'wholesaler-vikram-001', 'farmer-raju-001', 'listing-001', 'Onion (Nashik Red)', 200, 6000, 'processing', 'online', 'Azadpur Mandi, Delhi')
      ON CONFLICT (id) DO NOTHING
    `;

    // ── Verify ─────────────────────────────────────────────────────────
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const listingCount = await sql`SELECT COUNT(*) as count FROM listings`;
    const orderCount = await sql`SELECT COUNT(*) as count FROM orders`;

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      tables: {
        users: Number(userCount[0].count),
        listings: Number(listingCount[0].count),
        orders: Number(orderCount[0].count),
      },
    });
  } catch (error) {
    console.error('[db/setup] Error:', error);
    return NextResponse.json(
      { error: 'Database setup failed', details: String(error) },
      { status: 500 }
    );
  }
}
