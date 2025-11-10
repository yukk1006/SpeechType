'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';

interface AssetData {
  current_cash: number;
  current_account: number;
  total_assets: number;
  base_cash: number;
  base_account_balance: number;
  base_date: string | null;
  baseline_exists: boolean;
  stats: {
    cash_income: number;
    cash_expense: number;
    account_income: number;
    account_expense: number;
    total_actual_consumption: number;
  };
}

interface AssetCardProps {
  onBaselineClick: () => void;
}

export default function AssetCard({ onBaselineClick }: AssetCardProps) {
  const { data, isLoading, refetch, isRefetching } = useQuery<AssetData>({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await fetch('/api/assets');
      if (!res.ok) throw new Error('Failed to fetch assets');
      return res.json();
    },
  });

  const fmt = (n: number) => `¥ ${n.toLocaleString()}`;

  return (
    <Card className="shadow-sm border-zinc-200 bg-zinc-950 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-zinc-50">Current Assets</CardTitle>
        <CardDescription className="text-zinc-400">
          {data?.base_date
            ? `Baseline set on ${new Date(data.base_date).toLocaleDateString()}`
            : 'No baseline set'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {/* Total */}
            <div className="text-3xl font-bold mb-4">
              {fmt(data?.total_assets ?? 0)}
            </div>

            {/* Cash / Account breakdown */}
            <div className="space-y-2 text-sm text-zinc-300 mb-4">
              <div className="flex justify-between">
                <span>Cash</span>
                <span>{fmt(data?.current_cash ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Account</span>
                <span>{fmt(data?.current_account ?? 0)}</span>
              </div>
            </div>

            {/* Income / Expense stats */}
            <div className="pt-3 border-t border-zinc-800 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Total Income
                </span>
                <span className="text-zinc-200">
                  {fmt((data?.stats.cash_income ?? 0) + (data?.stats.account_income ?? 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Total Expense
                </span>
                <span className="text-zinc-200">
                  {fmt((data?.stats.cash_expense ?? 0) + (data?.stats.account_expense ?? 0))}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-800 mt-4">
        <Button
          variant="secondary"
          size="sm"
          className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching
            ? <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            : <RefreshCw className="h-3 w-3 mr-2" />}
          Recalculate
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white"
          onClick={onBaselineClick}
        >
          <ArrowRightLeft className="h-3 w-3 mr-2" /> Baseline
        </Button>
      </CardFooter>
    </Card>
  );
}
