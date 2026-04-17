import { createServiceClient } from '@/lib/supabase/server';
import { OrdersTable } from '@/components/admin/OrdersTable';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const orders = (data ?? []) as Order[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#EDEDED]">Orders</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
