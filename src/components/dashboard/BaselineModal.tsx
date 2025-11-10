'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  base_cash: z.coerce.number().int().min(0, 'Must be 0 or more'),
  base_account_balance: z.coerce.number().int().min(0, 'Must be 0 or more'),
});

type FormValues = z.infer<typeof formSchema>;

interface BaselineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BaselineModal({ isOpen, onClose }: BaselineModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const queryClient = useQueryClient();

  // Fetch existing baseline to prefill the form
  const { data: existing } = useQuery({
    queryKey: ['assets-baseline'],
    queryFn: async () => {
      const res = await fetch('/api/assets/baseline');
      if (!res.ok) throw new Error('Failed to fetch baseline');
      return res.json();
    },
    enabled: isOpen,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      base_cash: 0,
      base_account_balance: 0,
    },
  });

  // Prefill form when existing data loads
  useEffect(() => {
    if (existing?.exists) {
      form.reset({
        base_cash: existing.base_cash,
        base_account_balance: existing.base_account_balance,
      });
    }
  }, [existing, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Always use PATCH (upsert on backend)
      const res = await fetch('/api/assets/baseline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save baseline');
      }

      // Refresh asset card data
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets-baseline'] });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[380px] bg-white text-zinc-950 border-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Set Baseline Assets
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Enter your starting cash and account balance. This is the reference point for all calculations.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">

            <FormField
              control={form.control}
              name="base_cash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Cash (¥)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="border-zinc-300 focus-visible:ring-zinc-950 text-lg font-semibold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_account_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Account Balance (¥)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="border-zinc-300 focus-visible:ring-zinc-950 text-lg font-semibold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMsg && (
              <p className="text-sm font-medium text-red-500">{errorMsg}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : existing?.exists ? (
                'Update Baseline'
              ) : (
                'Set Baseline'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
