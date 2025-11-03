'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  asset_type: z.enum(['cash', 'account']),
  amount: z.coerce.number().int().min(1, 'Please enter a valid amount (≥1 ¥)'),
  actual_consumption_amount: z.coerce.number().int().min(0).default(0),
  memo: z.string().optional().default(''),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSuccess?: () => void; // Used in Step 4.3 to refresh data
}

export default function TransactionModal({
  isOpen,
  onClose,
  selectedDate,
  onSuccess,
}: TransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      asset_type: 'cash',
      amount: 0,
      actual_consumption_amount: 0,
      memo: '',
    },
  });

  const watchType = form.watch('type');
  const watchAmount = form.watch('amount');

  // Automatically sync consumption amount with expense amount as a UI convenience
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 0;
    form.setValue('amount', val);
    if (watchType === 'expense') {
      form.setValue('actual_consumption_amount', val);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...values,
        // income is technically 0 consumption in this strict DB model
        actual_consumption_amount: values.type === 'income' ? 0 : values.actual_consumption_amount,
        transaction_date: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save transaction');
      }

      form.reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white text-zinc-950 border-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Add Transaction
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'No date selected'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-zinc-300 focus:ring-zinc-950">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="asset_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-zinc-300 focus:ring-zinc-950">
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (¥)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      className="border-zinc-300 focus-visible:ring-zinc-950 text-lg font-semibold"
                      {...field}
                      onChange={handleAmountChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === 'expense' && (
              <FormField
                control={form.control}
                name="actual_consumption_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Consumption (¥)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        className="border-zinc-300 focus-visible:ring-zinc-950"
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-[11px] text-zinc-500">Edit only if partial outflow is not consumption.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memo (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Ramen for lunch" 
                      className="border-zinc-300 focus-visible:ring-zinc-950"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMsg && <p className="text-sm font-medium text-red-500">{errorMsg}</p>}

            <Button 
              type="submit" 
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Transaction'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
