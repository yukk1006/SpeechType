import Calendar from '@/components/calendar/Calendar';

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
        
        {/* Right Side: Assets & Summary placeholders set for 3.3 / Phase 5 */}
        <div className="space-y-6">
          <div className="border-2 border-dashed border-zinc-200 rounded-xl h-48 flex items-center justify-center text-zinc-500 bg-white">
            <p className="font-medium text-sm">Asset Overview (¥ JPY)</p>
          </div>
          <div className="border-2 border-dashed border-zinc-200 rounded-xl h-64 flex items-center justify-center text-zinc-500 bg-white">
            <p className="font-medium text-sm">Monthly Summary (¥ JPY)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
