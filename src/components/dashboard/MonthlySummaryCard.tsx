'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Minus, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

interface SummaryData {
  month: string;
  total_income: number;
  total_expense: number;
  total_actual_consumption: number;
  net_balance: number;
  transaction_count: number;
  has_data: boolean;
  has_prev_data: boolean;
  prev_total_expense: number | null;
  prev_total_actual_consumption: number | null;
  diff_income: number | null;
  diff_expense: number | null;
  diff_actual_consumption: number | null;
}

interface MonthlySummaryCardProps {
  month: string;
}

// Diff badge showing comparison against previous month
function DiffBadge({ diff, inverse = false }: { diff: number | null; inverse?: boolean }) {
  if (diff === null) {
    return <span className="text-[11px] text-zinc-400">— no prev data</span>;
  }
  if (diff === 0) {
    return <span className="text-[11px] text-zinc-400">= same as last month</span>;
  }

  const isBad = inverse ? diff > 0 : diff < 0;
  const color = isBad ? 'text-rose-500' : 'text-emerald-600';
  const Icon = diff > 0 ? ArrowUp : ArrowDown;
  const sign = diff > 0 ? '+' : '';

  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {sign}¥{Math.abs(diff).toLocaleString()} vs last month
    </span>
  );
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

            {/* Income */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <TrendingUp className="h-4 w-4" /> Income
                </div>
                <DiffBadge diff={data?.diff_income ?? null} inverse={false} />
              </div>
              <span className="font-semibold text-zinc-900">{fmt(data?.total_income ?? 0)}</span>
            </div>

            {/* Expense */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-rose-500">
                  <TrendingDown className="h-4 w-4" /> Expense
                </div>
                <DiffBadge diff={data?.diff_expense ?? null} inverse={true} />
              </div>
              <span className="font-semibold text-zinc-900">{fmt(data?.total_expense ?? 0)}</span>
            </div>

            <div className="border-t border-zinc-100" />

            {/* Actual Consumption */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-500">Actual Consumption</div>
                <DiffBadge diff={data?.diff_actual_consumption ?? null} inverse={true} />
              </div>
              <span className="font-semibold text-zinc-900">{fmt(data?.total_actual_consumption ?? 0)}</span>
            </div>

            {/* Net Balance */}
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
