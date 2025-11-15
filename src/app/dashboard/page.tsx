'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Calendar from '@/components/calendar/Calendar';
import AssetCard from '@/components/dashboard/AssetCard';
import BaselineModal from '@/components/dashboard/BaselineModal';
import MonthlySummaryCard from '@/components/dashboard/MonthlySummaryCard';

export default function DashboardPage() {
  const [isBaselineOpen, setIsBaselineOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

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
          
          {/* Monthly Summary Card — Phase 6 */}
          <MonthlySummaryCard month={currentMonth} />

          {/* Asset Card — now connected to real API */}
          <AssetCard onBaselineClick={() => setIsBaselineOpen(true)} />

        </div>
      </div>

      {/* Baseline Setting Modal */}
      <BaselineModal isOpen={isBaselineOpen} onClose={() => setIsBaselineOpen(false)} />
    </div>
  );
}
