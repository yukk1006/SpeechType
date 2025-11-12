import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const baselineSchema = z.object({
  base_cash: z.coerce.number().int().min(0, 'Cash must be 0 or more'),
  base_account_balance: z.coerce.number().int().min(0, 'Account balance must be 0 or more'),
  base_date: z.string().min(1, 'Baseline date is required'),
});

// GET — 현재 기준 자산 조회
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const baseline = await prisma.assetBaseline.findUnique({
      where: { user_id: session.userId },
    });

    // 기준 자산이 없으면 기본값(0) 반환
    if (!baseline) {
      return NextResponse.json({
        base_cash: 0,
        base_account_balance: 0,
        base_date: null,
        exists: false,
      });
    }

    return NextResponse.json({ ...baseline, exists: true });
  } catch (error) {
    console.error('[GET /api/assets/baseline]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST — 최초 기준 자산 등록
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = baselineSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { base_cash, base_account_balance, base_date } = result.data;

    const baseline = await prisma.assetBaseline.create({
      data: {
        user_id: session.userId,
        base_cash,
        base_account_balance,
        base_date: new Date(base_date),
      },
    });

    return NextResponse.json(baseline, { status: 201 });
  } catch (error) {
    console.error('[POST /api/assets/baseline]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH — 기준 자산 재설정
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = baselineSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { base_cash, base_account_balance, base_date } = result.data;

    const baseline = await prisma.assetBaseline.upsert({
      where: { user_id: session.userId },
      update: {
        base_cash,
        base_account_balance,
        base_date: new Date(base_date),
      },
      create: {
        user_id: session.userId,
        base_cash,
        base_account_balance,
        base_date: new Date(base_date),
      },
    });

    return NextResponse.json(baseline);
  } catch (error) {
    console.error('[PATCH /api/assets/baseline]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
