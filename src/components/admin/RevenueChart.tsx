'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Order } from '@/types';

interface RevenueChartProps {
  orders: Order[];
}

type Range = '30d' | '90d' | 'all';

function buildChartData(orders: Order[], range: Range) {
  const now = new Date();
  const cutoff = new Date();
  if (range === '30d') cutoff.setDate(now.getDate() - 30);
  else if (range === '90d') cutoff.setDate(now.getDate() - 90);
  else cutoff.setFullYear(2000);

  const filtered = orders.filter((o) => new Date(o.created_at) >= cutoff);

  const map: Record<string, number> = {};
  filtered.forEach((o) => {
    const d = new Date(o.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    map[d] = (map[d] ?? 0) + o.amount_total / 100;
  });

  return Object.entries(map)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }));
}

export function RevenueChart({ orders }: RevenueChartProps) {
  const [range, setRange] = useState<Range>('30d');
  const data = useMemo(() => buildChartData(orders, range), [orders, range]);

  const ranges: { value: Range; label: string }[] = [
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-[#EDEDED]">Revenue Over Time</h2>
        <div className="flex gap-1 bg-[#0D0D0D] rounded-lg p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r.value
                  ? 'bg-[#5B21B6] text-white'
                  : 'text-[#6B7280] hover:text-[#EDEDED]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">
          No revenue data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2D2D2D',
                borderRadius: '8px',
                color: '#EDEDED',
                fontSize: '12px',
              }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#5B21B6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#5B21B6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
