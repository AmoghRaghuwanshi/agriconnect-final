import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/orders — Fetch orders, optional ?buyerId= or ?farmerId=
export async function GET(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ orders: [] });

  const { searchParams } = new URL(request.url);
  const buyerId = searchParams.get('buyerId');
  const farmerId = searchParams.get('farmerId');

  const sql = neon(databaseUrl);

  try {
    let rows;
    if (buyerId) {
      rows = await sql`SELECT * FROM orders WHERE buyer_id = ${buyerId} ORDER BY created_at DESC`;
    } else if (farmerId) {
      rows = await sql`SELECT * FROM orders WHERE farmer_id = ${farmerId} ORDER BY created_at DESC`;
    } else {
      rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    }

    const orders = rows.map(mapOrderRow);
    return NextResponse.json({ orders, source: 'neon' });
  } catch (error) {
    return NextResponse.json({ orders: [], error: String(error) }, { status: 500 });
  }
}

// POST /api/orders — Create new order
export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  const body = await request.json();
  const sql = neon(databaseUrl);

  try {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    await sql`
      INSERT INTO orders (id, buyer_id, buyer_name, farmer_id, farmer_name, farm_name, listing_id, crop_name, order_type, quantity_kg, price_per_kg, total_amount, order_status, payment_status, payment_method, delivery_address)
      VALUES (
        ${id}, ${body.buyerId}, ${body.buyerName}, ${body.farmerId}, ${body.farmerName}, ${body.farmName || ''},
        ${body.listingId || null}, ${body.cropName}, ${body.orderType || 'B2C'}, ${body.quantityKg},
        ${body.pricePerKg}, ${body.totalAmount}, 'PENDING', 'PENDING', ${body.paymentMethod || 'COD'},
        ${JSON.stringify(body.deliveryAddress || {})}
      )
    `;

    // Reduce listing quantity
    if (body.listingId) {
      await sql`UPDATE listings SET quantity_remaining = quantity_remaining - ${body.quantityKg} WHERE id = ${body.listingId} AND quantity_remaining >= ${body.quantityKg}`;
    }

    return NextResponse.json({ id, success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT /api/orders — Update order status
export async function PUT(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  const body = await request.json();
  const { id, action, ...data } = body;
  const sql = neon(databaseUrl);
  const now = new Date().toISOString();

  try {
    switch (action) {
      case 'confirm':
        await sql`UPDATE orders SET order_status = 'CONFIRMED', confirmed_at = ${now} WHERE id = ${id}`;
        break;
      case 'ship':
        await sql`UPDATE orders SET order_status = 'OUT_FOR_DELIVERY', out_for_delivery_at = ${now} WHERE id = ${id}`;
        break;
      case 'deliver':
        await sql`UPDATE orders SET order_status = 'DELIVERED', delivered_at = ${now}, received_kg = ${data.receivedKg || null} WHERE id = ${id}`;
        break;
      case 'complete':
        await sql`UPDATE orders SET order_status = 'COMPLETED', completed_at = ${now} WHERE id = ${id}`;
        break;
      case 'cancel':
        await sql`UPDATE orders SET order_status = 'CANCELLED' WHERE id = ${id}`;
        break;
      case 'dispute':
        await sql`UPDATE orders SET order_status = 'DISPUTED', dispute_reason = ${data.reason || ''}, dispute_raised_at = ${now} WHERE id = ${id}`;
        break;
      case 'review':
        await sql`UPDATE orders SET review = ${JSON.stringify({ rating: data.rating, comment: data.comment, createdAt: now })}, order_status = 'COMPLETED', completed_at = ${now} WHERE id = ${id}`;
        break;
      case 'pay':
        await sql`UPDATE orders SET payment_status = 'PAID', payment_method = ${data.method || 'UPI'} WHERE id = ${id}`;
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function mapOrderRow(r: Record<string, unknown>) {
  return {
    id: r.id,
    buyerId: r.buyer_id,
    buyerName: r.buyer_name,
    farmerId: r.farmer_id,
    farmerName: r.farmer_name,
    farmName: r.farm_name,
    listingId: r.listing_id,
    cropName: r.crop_name,
    orderType: r.order_type || 'B2C',
    quantityKg: Number(r.quantity_kg),
    receivedKg: r.received_kg ? Number(r.received_kg) : undefined,
    pricePerKg: Number(r.price_per_kg),
    totalAmount: Number(r.total_amount),
    orderStatus: r.order_status || 'PENDING',
    paymentStatus: r.payment_status || 'PENDING',
    paymentMethod: r.payment_method,
    deliveryAddress: typeof r.delivery_address === 'string' ? JSON.parse(r.delivery_address) : (r.delivery_address || {}),
    review: typeof r.review === 'string' ? JSON.parse(r.review) : (r.review || undefined),
    disputeReason: r.dispute_reason,
    disputeRaisedAt: r.dispute_raised_at,
    confirmedAt: r.confirmed_at,
    outForDeliveryAt: r.out_for_delivery_at,
    deliveredAt: r.delivered_at,
    completedAt: r.completed_at,
    createdAt: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
  };
}
