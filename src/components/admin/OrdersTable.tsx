'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Mail, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

interface OrdersTableProps {
  orders: Order[];
}

type StatusFilter = 'all' | Order['status'];

const statusVariant: Record<Order['status'], 'success' | 'warning' | 'error' | 'neutral'> = {
  paid: 'warning',
  delivered: 'success',
  refunded: 'neutral',
  failed: 'error',
  pending: 'neutral',
};

const PAGE_SIZE = 20;

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'resend' | 'refund' | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.customer_email.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.stripe_session_id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  async function handleResend(orderId: string) {
    setActionId(orderId);
    setActionType('resend');
    try {
      const res = await fetch('/api/admin/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to resend');
      toast.success('Delivery email resent!');
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function handleRefund(orderId: string) {
    setActionId(orderId);
    setActionType('refund');
    try {
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to refund');
      toast.success('Refund issued successfully');
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to issue refund');
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  const statuses: StatusFilter[] = ['all', 'paid', 'delivered', 'refunded', 'failed', 'pending'];

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by email or order ID…"
            className="w-full bg-[#111111] border border-[#1F1F1F] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#EDEDED] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 bg-[#111111] border border-[#1F1F1F] rounded-lg p-1 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-[#5B21B6] text-white'
                  : 'text-[#6B7280] hover:text-[#EDEDED]'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-[#1F1F1F] rounded-2xl">
          <Search size={40} className="text-[#2D2D2D] mb-4" />
          <p className="text-[#9CA3AF] font-medium">No orders match your filters.</p>
          <p className="text-[#6B7280] text-sm mt-1">Try adjusting the search or status filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#1F1F1F]">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#1F1F1F] bg-[#0D0D0D]">
                {['Customer', 'Products', 'Amount', 'Status', 'Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => {
                const isActing = actionId === order.id;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-[#1F1F1F] last:border-0 hover:bg-[#0D0D0D] transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-[#EDEDED] font-medium truncate max-w-[180px]">
                        {order.customer_email}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5 font-mono truncate max-w-[180px]">
                        {order.id.slice(0, 8)}…
                      </p>
                    </td>

                    {/* Products */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {order.products.slice(0, 2).map((p, i) => (
                          <p key={i} className="text-xs text-[#9CA3AF] truncate max-w-[160px]">
                            {p.name}
                          </p>
                        ))}
                        {order.products.length > 2 && (
                          <p className="text-xs text-[#6B7280]">
                            +{order.products.length - 2} more
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-[#EDEDED]">
                        {formatPrice(order.amount_total)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[order.status]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#6B7280]">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Resend email — only for delivered orders */}
                        {(order.status === 'delivered' || order.status === 'paid') && (
                          <button
                            onClick={() => handleResend(order.id)}
                            disabled={isActing}
                            className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-50"
                            aria-label="Resend delivery email"
                            title="Resend delivery email"
                          >
                            {isActing && actionType === 'resend' ? (
                              <Spinner size="sm" />
                            ) : (
                              <Mail size={15} />
                            )}
                          </button>
                        )}

                        {/* Refund — only for paid/delivered orders */}
                        {(order.status === 'paid' || order.status === 'delivered') &&
                          order.stripe_payment_intent_id && (
                            <button
                              onClick={() => handleRefund(order.id)}
                              disabled={isActing}
                              className="p-2 rounded-lg text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-50"
                              aria-label="Issue refund"
                              title="Issue refund"
                            >
                              {isActing && actionType === 'refund' ? (
                                <Spinner size="sm" />
                              ) : (
                                <RotateCcw size={15} />
                              )}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#6B7280]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
            {filtered.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-[#6B7280]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
