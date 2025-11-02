import Calendar from '@/components/calendar/Calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';

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
              <CardDescription>March 2026 Overview</CardDescription>
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

          {/* Asset Card Scaffold */}
          <Card className="shadow-sm border-zinc-200 bg-zinc-950 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-zinc-50">Current Assets</CardTitle>
              <CardDescription className="text-zinc-400">Calculated from baseline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">¥ 0</div>
              <div className="space-y-2 text-sm text-zinc-300">
                <div className="flex justify-between">
                  <span>Cash</span>
                  <span>¥ 0</span>
                </div>
                <div className="flex justify-between">
                  <span>Account</span>
                  <span>¥ 0</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4 border-t border-zinc-800 mt-4">
              <Button variant="secondary" size="sm" className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold">
                <RefreshCw className="h-3 w-3 mr-2" /> Recalculate
              </Button>
              <Button variant="outline" size="sm" className="w-full border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white">
                <ArrowRightLeft className="h-3 w-3 mr-2" /> Baseline
              </Button>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}
