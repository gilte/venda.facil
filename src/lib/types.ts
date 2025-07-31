import type { Timestamp } from 'firebase/firestore';

export interface SalesNote {
  id: string;
  userId: string;
  customerName: string;
  customerAge: number;
  customerGender: 'Masculino' | 'Feminino' | 'Outro';
  productPurchased: string;
  purchaseAmount: number;
  paymentMethod: 'Cartão de Crédito' | 'Espécie';
  paymentStatus: 'À vista' | 'A prazo';
  installments?: number;
  createdAt: Timestamp;
}

export type SalesNoteFormData = Omit<SalesNote, 'id' | 'userId' | 'createdAt'>;
