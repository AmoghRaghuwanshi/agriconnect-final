import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

/**
 * GET /api/orders — Fetch orders from Neon DB.
 * Query params: ?userId=xxx&role=FARMER|CONSUMER
 */
export async function GET(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ orders: [], source: 'no-db' });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');

  try {
    const sql = neon(databaseUrl);

    let orders;
    if (userId && role === 'FARMER') {
      orders = await sql`
        SELECT o.*, u.name as buyer_name, u.phone as buyer_phone
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        WHERE o.farmer_id = ${userId}
        ORDER BY o.created_at DESC
      `;
    } else if (userId) {
      orders = await sql`
        SELECT o.*, u.name as farmer_name, u.phone as farmer_phone
        FROM orders o
        JOIN users u ON o.farmer_id = u.id
        WHERE o.buyer_id = ${userId}
        ORDER BY o.created_at DESC
      `;
    } else {
      // Admin — all orders
      orders = await sql`
        SELECT o.*,
          buyer.name as buyer_name,
          farmer.name as farmer_name
        FROM orders o
        JOIN users buyer ON o.buyer_id = buyer.id
        JOIN users farmer ON o.farmer_id = farmer.id
        ORDER BY o.created_at DESC
      `;
    }

    return NextResponse.json({ orders, source: 'neon' });
  } catch (error) {
    console.error('[api/orders] Error:', error);
    return NextResponse.json(
      { orders: [], source: 'error', error: String(error) },
      { status: 500 }
    );
  }
}
