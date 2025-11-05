import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

async function getMonthSummary(userId: string, date: Date) {
  const rangeStart = startOfMonth(date);
  const rangeEnd = endOfMonth(date);

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      transaction_date: { gte: rangeStart, lte: rangeEnd },
    },
    select: {
      type: true,
      amount: true,
      actual_consumption_amount: true,
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  let totalActualConsumption = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
      totalActualConsumption += tx.actual_consumption_amount;
    }
  }

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    total_actual_consumption: totalActualConsumption,
    net_balance: totalIncome - totalExpense,
    transaction_count: transactions.length,
    has_data: transactions.length > 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get('month'); // format: YYYY-MM

    const targetDate = monthStr
      ? new Date(`${monthStr}-01T00:00:00.000Z`)
      : new Date();

    const prevDate = subMonths(targetDate, 1);

    // 이번달 + 지난달 병렬 조회
    const [current, prev] = await Promise.all([
      getMonthSummary(session.userId, targetDate),
      getMonthSummary(session.userId, prevDate),
    ]);

    // diff 계산 (지난달 데이터 없으면 null)
    const diff_expense = prev.has_data ? current.total_expense - prev.total_expense : null;
    const diff_actual_consumption = prev.has_data
      ? current.total_actual_consumption - prev.total_actual_consumption
      : null;
    const diff_income = prev.has_data ? current.total_income - prev.total_income : null;

    return NextResponse.json({
      month: monthStr ?? targetDate.toISOString().slice(0, 7),

      // 이번달
      ...current,

      // 지난달
      prev_total_income: prev.has_data ? prev.total_income : null,
      prev_total_expense: prev.has_data ? prev.total_expense : null,
      prev_total_actual_consumption: prev.has_data ? prev.total_actual_consumption : null,
      has_prev_data: prev.has_data,

      // 비교 diff (null = 비교 불가)
      diff_income,
      diff_expense,
      diff_actual_consumption,
    });
  } catch (error) {
    console.error('[GET /api/summary]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
