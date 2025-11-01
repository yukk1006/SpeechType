import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}
