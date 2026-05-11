import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/stats — Dashboard stats from Neon
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  const sql = neon(databaseUrl);

  try {
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'FARMER') as total_farmers,
        (SELECT COUNT(*) FROM users WHERE role = 'CONSUMER') as total_consumers,
        (SELECT COUNT(*) FROM users WHERE role = 'WHOLESALER') as total_wholesalers,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM listings WHERE status = 'ACTIVE') as active_listings,
        (SELECT COUNT(*) FROM listings) as total_listings,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE order_status = 'PENDING') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE order_status = 'COMPLETED') as completed_orders,
        (SELECT COUNT(*) FROM orders WHERE order_status = 'DISPUTED') as disputed_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'PAID') as total_revenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'COMPLETED') as completed_revenue,
        (SELECT COALESCE(AVG(quantity_kg), 0) FROM orders) as avg_order_quantity
    `;

    return NextResponse.json({ stats: stats[0], source: 'neon' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
