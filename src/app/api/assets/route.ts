import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }


    const baseline = await prisma.assetBaseline.findUnique({
      where: { user_id: session.userId },
    });

    const baseCash = baseline?.base_cash ?? 0;
    const baseAccount = baseline?.base_account_balance ?? 0;
    const baseDate = baseline?.base_date ?? null;


    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: session.userId,
        ...(baseDate && {
          transaction_date: { gte: baseDate },
        }),
      },
      select: {
        type: true,
        asset_type: true,
        amount: true,
        actual_consumption_amount: true,
      },
    });

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
      current_cash: currentCash,
      current_account: currentAccount,
      total_assets: totalAssets,

      base_cash: baseCash,
      base_account_balance: baseAccount,
      base_date: baseline?.base_date ?? null,
      baseline_exists: !!baseline,

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
