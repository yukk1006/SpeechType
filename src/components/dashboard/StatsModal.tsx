'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CategoryData {
  category_id: string;
  category_name: string;
  type: string;
  total_amount: number;
  total_actual_consumption: number;
  count: number;
  percentage: number;
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string; // 'YYYY-MM'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

export default function StatsModal({ isOpen, onClose, month }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<'expense' | 'actual_consumption' | 'income'>('expense');

  const { data, isLoading } = useQuery<{ month: string; categories: CategoryData[] }>({
    queryKey: ['categories', month],
    queryFn: async () => {
      const res = await fetch(`/api/summary/categories?month=${month}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    enabled: isOpen,
  });

  const monthLabel = month
    ? new Date(`${month}-01`).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '';

  const categories = data?.categories || [];
  
  // Prepare chart data based on active tab
  const chartData = categories
    .filter((c) => {
      if (activeTab === 'expense') return c.type === 'expense' && c.total_amount > 0;
      if (activeTab === 'actual_consumption') return c.type === 'expense' && c.total_actual_consumption > 0;
      if (activeTab === 'income') return c.type === 'income' && c.total_amount > 0;
      return false;
    })
    .map((c) => ({
      name: c.category_name,
      value: activeTab === 'actual_consumption' ? c.total_actual_consumption : c.total_amount,
    }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-white text-zinc-950 border-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {monthLabel} Statistics
          </DialogTitle>
        </DialogHeader>

        {/* Custom Tabs */}
        <div className="flex bg-zinc-100 p-1 rounded-lg mt-2 space-x-1">
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 text-xs sm:text-sm font-medium py-1.5 rounded-md transition-all ${
              activeTab === 'expense'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setActiveTab('actual_consumption')}
            className={`flex-1 text-xs sm:text-sm font-medium py-1.5 rounded-md transition-all ${
              activeTab === 'actual_consumption'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Actual
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 text-xs sm:text-sm font-medium py-1.5 rounded-md transition-all ${
              activeTab === 'income'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Income
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 min-h-[300px] flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          ) : chartData.length === 0 ? (
            <p className="text-zinc-500 text-sm">No data available for this month.</p>
          ) : (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`¥ ${Number(value).toLocaleString()}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
