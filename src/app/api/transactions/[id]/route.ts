import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.user_id !== session.userId) {
      return NextResponse.json({ message: 'Transaction not found or unauthorized' }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/transactions/[id]]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
