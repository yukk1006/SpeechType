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

    const targetDate = monthStr
      ? new Date(`${monthStr}-01T00:00:00.000Z`)
      : new Date();

    const rangeStart = startOfMonth(targetDate);
    const rangeEnd = endOfMonth(targetDate);

    // Fetch transactions with category info
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
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    // Aggregate by category
    const categoryMap: Record<string, {
      category_id: string;
      category_name: string;
      type: string;
      total_amount: number;
      total_actual_consumption: number;
      count: number;
    }> = {};

    for (const tx of transactions) {
      const key = tx.category.id;
      if (!categoryMap[key]) {
        categoryMap[key] = {
          category_id: tx.category.id,
          category_name: tx.category.name,
          type: tx.type,
          total_amount: 0,
          total_actual_consumption: 0,
          count: 0,
        };
      }
      categoryMap[key].total_amount += tx.amount;
      categoryMap[key].count += 1;
      if (tx.type === 'expense') {
        categoryMap[key].total_actual_consumption += tx.actual_consumption_amount;
      }
    }

    const categories = Object.values(categoryMap).sort(
      (a, b) => b.total_amount - a.total_amount
    );

    // Total for percentage calculation
    const totalExpense = categories
      .filter((c) => c.type === 'expense')
      .reduce((sum, c) => sum + c.total_amount, 0);

    const totalIncome = categories
      .filter((c) => c.type === 'income')
      .reduce((sum, c) => sum + c.total_amount, 0);

    // Add percentage field
    const categoriesWithPct = categories.map((c) => ({
      ...c,
      percentage: c.type === 'expense'
        ? totalExpense > 0 ? Math.round((c.total_amount / totalExpense) * 100) : 0
        : totalIncome > 0 ? Math.round((c.total_amount / totalIncome) * 100) : 0,
    }));

    return NextResponse.json({
      month: monthStr ?? targetDate.toISOString().slice(0, 7),
      categories: categoriesWithPct,
    });
  } catch (error) {
    console.error('[GET /api/summary/categories]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
