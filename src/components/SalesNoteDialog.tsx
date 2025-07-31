"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { SalesNote, SalesNoteFormData } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  customerName: z.string().min(2, { message: 'O nome do cliente é obrigatório.' }),
  customerAge: z.coerce.number().int().positive({ message: 'A idade deve ser um número positivo.' }),
  customerGender: z.enum(['Masculino', 'Feminino', 'Outro']),
  productPurchased: z.string().min(2, { message: 'O nome do produto é obrigatório.' }),
  purchaseAmount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  paymentMethod: z.enum(['Cartão de Crédito', 'Espécie']),
  paymentStatus: z.enum(['À vista', 'A prazo']),
  installments: z.coerce.number().int().optional(),
}).refine(data => {
  if (data.paymentStatus === 'A prazo') {
    return data.installments && data.installments > 0;
  }
  return true;
}, {
  message: 'A quantidade de vezes é obrigatória para pagamento a prazo.',
  path: ['installments'],
});

interface SalesNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  note: SalesNote | null;
}

export function SalesNoteDialog({ open, onOpenChange, onSuccess, note }: SalesNoteDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<SalesNoteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        customerName: '',
        customerAge: 0,
        customerGender: 'Masculino',
        productPurchased: '',
        purchaseAmount: 0,
        paymentMethod: 'Cartão de Crédito',
        paymentStatus: 'À vista',
        installments: undefined,
    }
  });

  const paymentStatus = form.watch('paymentStatus');

  useEffect(() => {
    if (note) {
      form.reset({
        ...note,
        installments: note.installments ?? undefined,
      });
    } else {
      form.reset({
        customerName: '',
        customerAge: 0,
        customerGender: 'Masculino',
        productPurchased: '',
        purchaseAmount: 0,
        paymentMethod: 'Cartão de Crédito',
        paymentStatus: 'À vista',
        installments: undefined,
      });
    }
  }, [note, form]);

  const onSubmit = async (data: SalesNoteFormData) => {
    setLoading(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      const method = note ? 'PUT' : 'POST';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = note ? `${baseUrl}/api/sales-notes/${note.id}` : `${baseUrl}/api/sales-notes`;
      
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar a venda.');
      }
      
      toast({ title: "Sucesso!", description: note ? "Venda atualizada." : "Nova venda registrada." });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar a venda." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{note ? 'Editar Venda' : 'Adicionar Nova Venda'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl><Input {...field} /></FormControl><FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="customerAge" render={({ field }) => (<FormItem><FormLabel>Idade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="customerGender" render={({ field }) => (<FormItem><FormLabel>Sexo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="productPurchased" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Produto Comprado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="purchaseAmount" render={({ field }) => (<FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="paymentMethod" render={({ field }) => (<FormItem><FormLabel>Forma de Pagamento</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem><SelectItem value="Espécie">Espécie</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="paymentStatus" render={({ field }) => (<FormItem><FormLabel>Status do Pagamento</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="À vista">À vista</SelectItem><SelectItem value="A prazo">A prazo</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            {paymentStatus === 'A prazo' && (
              <FormField control={form.control} name="installments" render={({ field }) => (<FormItem><FormLabel>Qtd. Vezes</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            )}
            <DialogFooter className="col-span-2 pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
