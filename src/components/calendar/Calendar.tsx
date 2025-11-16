'use client';

import { useState } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay
} from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TransactionModal from './TransactionModal';
import DailyTransactionList from './DailyTransactionList';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  onMonthChange?: (month: string) => void;
}

export default function Calendar({ onMonthChange }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);

  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => {
    const next = addMonths(currentDate, 1);
    setCurrentDate(next);
    onMonthChange?.(format(startOfMonth(next), 'yyyy-MM'));
  };
  const prevMonth = () => {
    const prev = subMonths(currentDate, 1);
    setCurrentDate(prev);
    onMonthChange?.(format(startOfMonth(prev), 'yyyy-MM'));
  };

  const queryClient = useQueryClient();
  const currentMonthStr = format(monthStart, 'yyyy-MM');
  
  // 4.3 Fetch transactions for the visible month
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', currentMonthStr],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?month=${currentMonthStr}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    }
  });

  // Map transactions by their stringified dates ('yyyy-MM-dd')
  const transactionsByDate = transactions.reduce((acc: Record<string, any[]>, tx: any) => {
    // tx.transaction_date is an ISO string "YYYY-MM-DDTHH:mm..."
    const dateStr = format(new Date(tx.transaction_date), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(tx);
    return acc;
  }, {});

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    // Modal will no longer open automatically. 
    // User must click "+ Add" from the DailyTransactionList.
  };

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl shadow-sm p-4 sm:p-6 text-zinc-950">
      {/* 3.2.2: Calendar Header & Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 3.2.2: Days of Week Row */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-zinc-400 py-2 uppercase tracking-tight">
            {day}
          </div>
        ))}
      </div>

      {/* 3.2.3: Calendar Grid & Date Cells */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 sm:gap-y-2 sm:gap-x-2">
        {days.map((day) => {
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayStr = format(day, 'yyyy-MM-dd');
          
          // Check for transactions on this day
          const dayTransactions = transactionsByDate[dayStr] || [];
          const hasIncome = dayTransactions.some((t: any) => t.type === 'income');
          const hasExpense = dayTransactions.some((t: any) => t.type === 'expense');

          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={cn(
                "h-10 w-full sm:h-12 flex flex-col items-center justify-center rounded-lg text-sm transition-all relative font-medium",

                !isSelected && "hover:bg-zinc-100",
                !isCurrentMonth && !isSelected && "text-zinc-300",
                isCurrentMonth && !isSelected && "text-zinc-900",

                isToday && !isSelected && "bg-zinc-100 text-zinc-900 font-bold border border-zinc-200",
                isSelected && "bg-zinc-950 text-white shadow-md font-bold hover:bg-zinc-800"
              )}
            >
              <span className="z-10">{format(day, 'd')}</span>

              {/* Transaction Dot Indicators */}
              {(hasIncome || hasExpense) && (
                <div className="absolute bottom-1.5 flex gap-1 items-center justify-center w-full">
                  {hasExpense && <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full" title="Expense" />}
                  {hasIncome && <div className="h-1.5 w-1.5 bg-zinc-950 rounded-full" title="Income" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 4.4 Daily Transaction View (Option A UI) */}
      <DailyTransactionList 
        date={selectedDate} 
        transactions={selectedDate ? (transactionsByDate[format(selectedDate, 'yyyy-MM-dd')] || []) : []} 
        onAddClick={() => setIsModalOpen(true)}
      />

      {/* Transaction Entry Modal (Step 4.2) */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={selectedDate}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['transactions'] })}
      />
    </div>
  );
}
