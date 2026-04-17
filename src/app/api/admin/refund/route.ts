import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let orderId: string;
  try {
    const body = await request.json();
    orderId = body.orderId;
    if (!orderId) throw new Error('Missing orderId');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!order.stripe_payment_intent_id) {
    return NextResponse.json(
      { error: 'No payment intent found for this order' },
      { status: 400 }
    );
  }

  if (order.status === 'refunded') {
    return NextResponse.json({ error: 'Order is already refunded' }, { status: 400 });
  }

  if (order.status !== 'paid' && order.status !== 'delivered') {
    return NextResponse.json(
      { error: 'Only paid or delivered orders can be refunded' },
      { status: 400 }
    );
  }

  // Issue refund via Stripe
  try {
    await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe refund failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Update order status in DB
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', orderId);

  if (updateError) {
    return NextResponse.json(
      { error: 'Refund issued but failed to update order status' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
