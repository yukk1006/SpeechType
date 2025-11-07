'use client';

import Calendar from '@/components/calendar/Calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import AssetCard from '@/components/dashboard/AssetCard';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500">Welcome to your personal finance overview.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Calendar (Takes up 2/3 space on large screens) */}
        <div className="lg:col-span-2">
          <Calendar />
        </div>
        
        {/* Right Side: Assets & Summary */}
        <div className="space-y-6">
          
          {/* Monthly Summary Scaffold */}
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Monthly Summary</CardTitle>
              <CardDescription>Overview (Phase 6)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <TrendingUp className="h-4 w-4" /> Income
                  </div>
                  <span className="font-semibold text-zinc-900">¥ 0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-rose-500">
                    <TrendingDown className="h-4 w-4" /> Outflow
                  </div>
                  <span className="font-semibold text-zinc-900">¥ 0</span>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-500">
                    Actual Consumption
                  </div>
                  <span className="font-semibold text-zinc-900">¥ 0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Card — now connected to real API */}
          <AssetCard onBaselineClick={() => {}} />

        </div>
      </div>
    </div>
  );
}
