import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 1. 기준 자산 조회
    const baseline = await prisma.assetBaseline.findUnique({
      where: { user_id: session.userId },
    });

    const baseCash = baseline?.base_cash ?? 0;
    const baseAccount = baseline?.base_account_balance ?? 0;

    // 2. 전체 거래 내역 조회 (asset_type별로 수입/지출 합산)
    const transactions = await prisma.transaction.findMany({
      where: { user_id: session.userId },
      select: {
        type: true,
        asset_type: true,
        amount: true,
        actual_consumption_amount: true,
      },
    });

    // 3. 계산
    let cashIncome = 0;
    let cashExpense = 0;
    let accountIncome = 0;
    let accountExpense = 0;
    let totalActualConsumption = 0;

    for (const tx of transactions) {
      if (tx.asset_type === 'cash') {
        if (tx.type === 'income') cashIncome += tx.amount;
        else cashExpense += tx.amount;
      } else {
        if (tx.type === 'income') accountIncome += tx.amount;
        else accountExpense += tx.amount;
      }
      if (tx.type === 'expense') {
        totalActualConsumption += tx.actual_consumption_amount;
      }
    }

    const currentCash = baseCash + cashIncome - cashExpense;
    const currentAccount = baseAccount + accountIncome - accountExpense;
    const totalAssets = currentCash + currentAccount;

    return NextResponse.json({
      // 현재 자산
      current_cash: currentCash,
      current_account: currentAccount,
      total_assets: totalAssets,

      // 기준 자산 원본
      base_cash: baseCash,
      base_account_balance: baseAccount,
      base_date: baseline?.base_date ?? null,
      baseline_exists: !!baseline,

      // 통계
      stats: {
        cash_income: cashIncome,
        cash_expense: cashExpense,
        account_income: accountIncome,
        account_expense: accountExpense,
        total_actual_consumption: totalActualConsumption,
      },
    });
  } catch (error) {
    console.error('[GET /api/assets]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
