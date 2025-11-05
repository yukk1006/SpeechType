'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Minus, Loader2 } from 'lucide-react';

interface SummaryData {
  month: string;
  total_income: number;
  total_expense: number;
  total_actual_consumption: number;
  net_balance: number;
  transaction_count: number;
}

interface MonthlySummaryCardProps {
  month: string;
}

export default function MonthlySummaryCard({ month }: MonthlySummaryCardProps) {
  const { data, isLoading } = useQuery<SummaryData>({
    queryKey: ['summary', month],
    queryFn: async () => {
      const res = await fetch(`/api/summary?month=${month}`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
  });

  const fmt = (n: number) => `¥ ${n.toLocaleString()}`;

  const monthLabel = new Date(`${month}-01`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <Card className="shadow-sm border-zinc-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Monthly Summary</CardTitle>
        <CardDescription className="text-zinc-400 text-xs">{monthLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="space-y-3">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <TrendingUp className="h-4 w-4" /> Income
              </div>
              <span className="font-semibold text-zinc-900">{fmt(data?.total_income ?? 0)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-rose-500">
                <TrendingDown className="h-4 w-4" /> Expense
              </div>
              <span className="font-semibold text-zinc-900">{fmt(data?.total_expense ?? 0)}</span>
            </div>

            <div className="border-t border-zinc-100" />

            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-500">Actual Consumption</div>
              <span className="font-semibold text-zinc-900">{fmt(data?.total_actual_consumption ?? 0)}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Minus className="h-4 w-4" /> Net Balance
              </div>
              <span className={`font-bold text-base ${(data?.net_balance ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {(data?.net_balance ?? 0) >= 0 ? '+' : ''}{fmt(data?.net_balance ?? 0)}
              </span>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
