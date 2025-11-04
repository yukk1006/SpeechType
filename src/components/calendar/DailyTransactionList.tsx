'use client';

import { format } from 'date-fns';
import { Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  memo: string | null;
  category?: {
    name: string;
  };
}

interface DailyTransactionListProps {
  date: Date | null;
  transactions: Transaction[];
  onAddClick: () => void;
}

export default function DailyTransactionList({ date, transactions, onAddClick }: DailyTransactionListProps) {
  if (!date) return null;

  return (
    <div className="mt-6 pt-6 border-t border-zinc-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
          Transactions for {format(date, 'MMM d, yyyy')}
        </h3>
        <Button size="sm" onClick={onAddClick} className="bg-zinc-950 text-white hover:bg-zinc-800 h-8">
          + Add New
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
          <p className="text-sm text-zinc-500 mb-3">No transactions recorded for this date.</p>
          <Button variant="outline" size="sm" onClick={onAddClick} className="text-zinc-600">
            Create First Transaction
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-100 bg-white hover:bg-zinc-50 transition-colors gap-3 group">
              
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                <div className={`p-2 rounded-full flex-shrink-0 ${tx.type === 'income' ? 'bg-zinc-100 text-zinc-900' : 'bg-red-50 text-red-500'}`}>
                  {tx.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-zinc-900 truncate">
                    {tx.category?.name || 'Uncategorized'}
                  </p>
                  {tx.memo && (
                    <p className="text-xs text-zinc-500 truncate">{tx.memo}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                <div className={`font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-zinc-900' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'} ¥ {tx.amount.toLocaleString()}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-zinc-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('삭제 백엔드 API 기능은 나중에 연결할 예정입니다! 눈에 보이는 UI 요소만 구성되어 있습니다. 🛠️');
                  }}
                  title="Delete Transaction"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
