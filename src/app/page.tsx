"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SalesNotesTable } from '@/components/SalesNotesTable';
import { SalesNoteDialog } from '@/components/SalesNoteDialog';
import { DeleteNoteAlert } from '@/components/DeleteNoteAlert';
import type { SalesNote } from '@/lib/types';
import { PlusCircle, LogOut, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SalesNote | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleAddNew = () => {
    setEditingNote(null);
    setIsNoteDialogOpen(true);
  };

  const handleEdit = (note: SalesNote) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };

  const handleDelete = (noteId: string) => {
    setDeletingNoteId(noteId);
    setIsDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };
  
  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="font-headline text-2xl font-bold text-primary">Venda Fácil</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-3xl font-semibold">Suas Vendas</h2>
          <Button onClick={handleAddNew}>
            <PlusCircle />
            <span>Adicionar Venda</span>
          </Button>
        </div>
        
        <SalesNotesTable key={refreshKey} onEdit={handleEdit} onDelete={handleDelete} />
      </main>

      <SalesNoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        onSuccess={handleSuccess}
        note={editingNote}
      />

      <DeleteNoteAlert
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleSuccess}
        noteId={deletingNoteId}
      />
    </div>
  );
}
