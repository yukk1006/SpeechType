import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { startOfMonth, endOfMonth } from 'date-fns';

const transactionSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1 ¥.'),
  type: z.enum(['INCOME', 'EXPENSE']),
  isConsumption: z.boolean().default(true),
  description: z.string().min(1, 'Description is required.'),
  date: z.string(), // ISO String from frontend
  categoryId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = transactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amount, type, isConsumption, description, date, categoryId } = result.data;

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        // Income is never "consumption", only expenses can be actual consumption
        isConsumption: type === 'EXPENSE' ? isConsumption : false,
        description,
        date: new Date(date),
        userId: session.userId,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('[POST /api/transactions]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get('month'); // Expecting format: YYYY-MM

    let dateFilter = {};
    
    if (monthStr) {
      // Return transactions only inside the bounded month
      const targetDate = new Date(`${monthStr}-01T00:00:00.000Z`);
      
      // We will allow slightly outside bounds in the frontend if needed, 
      // but for the backend payload we fetch strictly the exact month for aggregation.
      // (Alternately, client can just fetch all or we can broaden the range by a week)
      // To ensure calendar leading/trailing dates render properly, 
      // let's expand the fetch by 7 days in both directions.
      
      const paddedStart = new Date(startOfMonth(targetDate));
      paddedStart.setDate(paddedStart.getDate() - 7);
      
      const paddedEnd = new Date(endOfMonth(targetDate));
      paddedEnd.setDate(paddedEnd.getDate() + 7);

      dateFilter = {
        date: {
          gte: paddedStart,
          lte: paddedEnd,
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.userId,
        ...dateFilter,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[GET /api/transactions]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
