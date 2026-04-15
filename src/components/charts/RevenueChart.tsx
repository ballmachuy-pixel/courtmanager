'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockData = [
  { name: 'Tháng 1', revenue: 45000000, overdue: 5000000 },
  { name: 'Tháng 2', revenue: 52000000, overdue: 4000000 },
  { name: 'Tháng 3', revenue: 48000000, overdue: 8000000 },
  { name: 'Tháng 4', revenue: 61000000, overdue: 2000000 },
];

export function RevenueChart() {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <LineChart data={mockData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `${value / 1000000}tr`}
          />
          <Tooltip 
            formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" name="Thực thu" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="overdue" name="Nợ đọng chờ thu" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
