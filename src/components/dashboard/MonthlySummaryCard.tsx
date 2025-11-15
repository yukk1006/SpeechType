'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface MonthlySummaryCardProps {
  month: string; // 'YYYY-MM' format
}

export default function MonthlySummaryCard({ month }: MonthlySummaryCardProps) {
  // Placeholder values — will be replaced with real data in #4
  const data = {
    total_income: 0,
    total_expense: 0,
    total_actual_consumption: 0,
    net_balance: 0,
  };

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
        <div className="space-y-3">

          {/* Income */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <TrendingUp className="h-4 w-4" /> Income
            </div>
            <span className="font-semibold text-zinc-900">{fmt(data.total_income)}</span>
          </div>

          {/* Expense */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-rose-500">
              <TrendingDown className="h-4 w-4" /> Expense
            </div>
            <span className="font-semibold text-zinc-900">{fmt(data.total_expense)}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-100" />

          {/* Actual Consumption */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-500">Actual Consumption</div>
            <span className="font-semibold text-zinc-900">{fmt(data.total_actual_consumption)}</span>
          </div>

          {/* Net Balance */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <Minus className="h-4 w-4" /> Net Balance
            </div>
            <span className={`font-bold text-base ${data.net_balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {data.net_balance >= 0 ? '+' : ''}{fmt(data.net_balance)}
            </span>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
