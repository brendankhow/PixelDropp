'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Order } from '@/types';

interface CategoryChartProps {
  orders: Order[];
  productCategoryMap: Record<string, string>;
}

const categoryLabels: Record<string, string> = {
  iphone: 'iPhone',
  desktop: 'Desktop',
  bundle: 'Bundle',
  other: 'Other',
};

export function CategoryChart({ orders, productCategoryMap }: CategoryChartProps) {
  const revenueByCategory: Record<string, number> = {};

  orders.forEach((order) => {
    order.products.forEach((item) => {
      const cat = productCategoryMap[item.id] ?? 'other';
      revenueByCategory[cat] = (revenueByCategory[cat] ?? 0) + item.price / 100;
    });
  });

  const data = Object.entries(categoryLabels).map(([key, label]) => ({
    category: label,
    revenue: parseFloat((revenueByCategory[key] ?? 0).toFixed(2)),
  }));

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
      <h2 className="text-base font-semibold text-[#EDEDED] mb-6">Revenue by Category</h2>
      {orders.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">
          No revenue data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
            <XAxis
              dataKey="category"
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
            <Bar dataKey="revenue" fill="#5B21B6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
