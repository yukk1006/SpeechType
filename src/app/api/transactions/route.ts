import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { startOfMonth, endOfMonth } from 'date-fns';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  asset_type: z.enum(['cash', 'account']),
  amount: z.number().int().min(1, 'Amount must be at least 1 ¥.'),
  actual_consumption_amount: z.number().int().min(0),
  memo: z.string().optional().nullable(),
  transaction_date: z.string(), // ISO String
  category_id: z.string().optional().nullable(),
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
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, asset_type, amount, actual_consumption_amount, memo, transaction_date, category_id } = result.data;

    // 만약 전달받은 카테고리가 없다면, 시스템에 있는 첫 번째 임의 카테고리를 찾아 연결하거나 임시로 만듭니다.
    // (이후 프론트엔드 모달이 개발되면 유저가 무조건 선택하게 됨)
    let finalCategoryId = category_id;
    if (!finalCategoryId) {
      let fallbackCategory = await prisma.category.findFirst({ where: { type } });
      if (!fallbackCategory) {
        fallbackCategory = await prisma.category.create({
          data: { name: 'Default', type }
        });
      }
      finalCategoryId = fallbackCategory.id;
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        actual_consumption_amount,
        type,
        asset_type,
        memo: memo || null,
        transaction_date: new Date(transaction_date),
        user_id: session.userId,
        category_id: finalCategoryId,
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
      const targetDate = new Date(`${monthStr}-01T00:00:00.000Z`);
      const paddedStart = new Date(startOfMonth(targetDate));
      paddedStart.setDate(paddedStart.getDate() - 7);

      const paddedEnd = new Date(endOfMonth(targetDate));
      paddedEnd.setDate(paddedEnd.getDate() + 7);

      dateFilter = {
        transaction_date: {
          gte: paddedStart,
          lte: paddedEnd,
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: session.userId,
        ...dateFilter,
      },
      orderBy: {
        transaction_date: 'desc', // 최신순(내림차순) 정렬
      },
      include: {
        category: true, // 연결된 카테고리 이름도 같이 불러오기!
      }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[GET /api/transactions]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
