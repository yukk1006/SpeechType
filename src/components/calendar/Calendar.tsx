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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TransactionModal from './TransactionModal';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    // Open modal directly when clicking a date for smooth UX
    setIsModalOpen(true);
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
              <span>{format(day, 'd')}</span>

              {/* Optional: Phase 4 transaction dot indicator placeholder. 
                  In reality, we will render a dot here if the day has history. */}
              {/* <div className="absolute bottom-1 h-1 w-1 bg-zinc-300 rounded-full"></div> */}
            </button>
          );
        })}
      </div>

      {/* Transaction Entry Modal (Step 4.2) */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={selectedDate}
        onSuccess={() => console.log('Transaction added (Need React Query refresh in 4.3)')}
      />
    </div>
  );
}
