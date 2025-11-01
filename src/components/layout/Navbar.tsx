'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar({ email }: { email: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Invalidate router cache and force navigation to login
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2 font-bold text-zinc-950">
          <Wallet className="h-5 w-5" />
          <span className="text-xl tracking-tight">Finance App</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 hidden sm:inline-block">
            {email}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="text-zinc-500 hover:text-zinc-950"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
