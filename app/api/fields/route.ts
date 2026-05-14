import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ fields: [] });

  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmerId');

  if (!farmerId) {
    return NextResponse.json({ error: 'Farmer ID required' }, { status: 400 });
  }

  const sql = neon(databaseUrl);

  try {
    const rows = await sql`SELECT * FROM fields WHERE farmer_id = ${farmerId} ORDER BY created_at DESC`;
    return NextResponse.json({ fields: rows, source: 'neon' });
  } catch (error) {
    return NextResponse.json({ fields: [], error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  const body = await request.json();
  const sql = neon(databaseUrl);

  try {
    const id = `F${Date.now().toString(36).toUpperCase()}`;
    const coordinatesJson = JSON.stringify(body.coordinates);

    await sql`
      INSERT INTO fields (
        id, farmer_id, name, area_ha, coordinates, center_lat, center_lng
      )
      VALUES (
        ${id}, ${body.farmerId}, ${body.name}, ${body.areaHectares}, ${coordinatesJson}, ${body.centerLat}, ${body.centerLng}
      )
    `;

    return NextResponse.json({ id, success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
