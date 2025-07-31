"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { SalesNote } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface SalesNotesTableProps {
  onEdit: (note: SalesNote) => void;
  onDelete: (noteId: string) => void;
}

export function SalesNotesTable({ onEdit, onDelete }: SalesNotesTableProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<SalesNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const headers: HeadersInit = {};
        if (user) {
          const token = await user.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${baseUrl}/api/sales-notes`, { headers });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setNotes([]);
            setLoading(false);
            return;
          }
          throw new Error('Falha ao buscar dados.');
        }
        const notesData = await response.json();
        setNotes(notesData);
      } catch (error) {
        console.error("Error fetching notes: ", error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <h3 className="font-headline text-xl font-semibold">Nenhuma venda registrada</h3>
          <p className="text-muted-foreground mt-2">Clique em "Adicionar Venda" para começar.</p>
        </CardContent>
      </Card>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Produto</TableHead>
            <TableHead className="hidden sm:table-cell">Valor</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note.id}>
              <TableCell>
                <div className="font-medium">{note.customerName}</div>
                <div className="text-sm text-muted-foreground md:hidden">{note.productPurchased}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{note.productPurchased}</TableCell>
              <TableCell className="hidden sm:table-cell">{formatCurrency(note.purchaseAmount)}</TableCell>
              <TableCell>
                 <Badge variant={note.paymentStatus === 'À vista' ? 'default' : 'secondary'} className="capitalize">
                    {note.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(note)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
