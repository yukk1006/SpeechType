import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get('month'); // format: YYYY-MM

    // Determine date range
    const targetDate = monthStr
      ? new Date(`${monthStr}-01T00:00:00.000Z`)
      : new Date();

    const rangeStart = startOfMonth(targetDate);
    const rangeEnd = endOfMonth(targetDate);

    // Fetch all transactions for the month
    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: session.userId,
        transaction_date: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
      select: {
        type: true,
        amount: true,
        actual_consumption_amount: true,
      },
    });

    // Aggregate
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

    const netBalance = totalIncome - totalExpense;

    return NextResponse.json({
      month: monthStr ?? targetDate.toISOString().slice(0, 7),
      total_income: totalIncome,
      total_expense: totalExpense,
      total_actual_consumption: totalActualConsumption,
      net_balance: netBalance,
      transaction_count: transactions.length,
    });
  } catch (error) {
    console.error('[GET /api/summary]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
