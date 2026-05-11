import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/listings — Fetch listings, optional ?farmerId= and ?status= filters
export async function GET(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ listings: [] });

  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmerId');
  const status = searchParams.get('status');

  const sql = neon(databaseUrl);

  try {
    let rows;
    if (farmerId && status) {
      rows = await sql`SELECT * FROM listings WHERE farmer_id = ${farmerId} AND status = ${status} ORDER BY created_at DESC`;
    } else if (farmerId) {
      rows = await sql`SELECT * FROM listings WHERE farmer_id = ${farmerId} ORDER BY created_at DESC`;
    } else if (status) {
      rows = await sql`SELECT * FROM listings WHERE status = ${status} ORDER BY created_at DESC`;
    } else {
      rows = await sql`SELECT * FROM listings WHERE status = 'ACTIVE' ORDER BY created_at DESC`;
    }

    const listings = rows.map(mapRow);
    return NextResponse.json({ listings, source: 'neon' });
  } catch (error) {
    return NextResponse.json({ listings: [], error: String(error) }, { status: 500 });
  }
}

// POST /api/listings — Create new listing
export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  const body = await request.json();
  const sql = neon(databaseUrl);

  try {
    const id = `L${Date.now().toString(36).toUpperCase()}`;
    await sql`
      INSERT INTO listings (id, farmer_id, farmer_name, farm_name, crop_name, variety, category, quantity_kg, quantity_remaining, price_per_kg, min_order_kg, harvest_date, storage_type, description, status, is_b2b, is_b2c, expires_at, location, state, organic)
      VALUES (
        ${id}, ${body.farmerId}, ${body.farmerName}, ${body.farmName}, ${body.cropName}, ${body.variety || ''},
        ${body.category || 'Vegetables'}, ${body.quantityKg}, ${body.quantityKg}, ${body.pricePerKg},
        ${body.minOrderKg || 1}, ${body.harvestDate || null}, ${body.storageType || null}, ${body.description || ''},
        'ACTIVE', ${body.isB2b !== false}, ${body.isB2c !== false}, ${body.expiresAt || null},
        ${body.location || ''}, ${body.state || ''}, ${body.organic || false}
      )
    `;

    return NextResponse.json({ id, success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT /api/listings — Update listing
export async function PUT(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  const body = await request.json();
  const { id, ...updates } = body;
  const sql = neon(databaseUrl);

  try {
    // Build dynamic update
    if (updates.status) {
      await sql`UPDATE listings SET status = ${updates.status} WHERE id = ${id}`;
    }
    if (updates.pricePerKg !== undefined) {
      await sql`UPDATE listings SET price_per_kg = ${updates.pricePerKg} WHERE id = ${id}`;
    }
    if (updates.quantityKg !== undefined) {
      await sql`UPDATE listings SET quantity_kg = ${updates.quantityKg}, quantity_remaining = ${updates.quantityKg} WHERE id = ${id}`;
    }
    if (updates.description !== undefined) {
      await sql`UPDATE listings SET description = ${updates.description} WHERE id = ${id}`;
    }
    if (updates.cropName !== undefined) {
      await sql`UPDATE listings SET crop_name = ${updates.cropName} WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE /api/listings?id=xxx — Delete (set EXPIRED)
export async function DELETE(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const sql = neon(databaseUrl);

  try {
    await sql`UPDATE listings SET status = 'EXPIRED' WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function mapRow(r: Record<string, unknown>) {
  return {
    id: r.id,
    farmerId: r.farmer_id,
    farmerName: r.farmer_name,
    farmName: r.farm_name,
    cropName: r.crop_name,
    variety: r.variety || '',
    category: r.category || 'Vegetables',
    quantityKg: Number(r.quantity_kg),
    quantityRemaining: Number(r.quantity_remaining),
    pricePerKg: Number(r.price_per_kg),
    minOrderKg: Number(r.min_order_kg),
    harvestDate: r.harvest_date || '',
    storageType: r.storage_type || '',
    description: r.description || '',
    images: r.images || [],
    status: r.status || 'ACTIVE',
    isB2b: r.is_b2b,
    isB2c: r.is_b2c,
    expiresAt: r.expires_at || '',
    location: r.location || '',
    state: r.state || '',
    organic: r.organic || false,
    views: Number(r.views || 0),
    createdAt: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
  };
}
