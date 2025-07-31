
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
  createdAt: string; // Changed from Timestamp to string
}

export type SalesNoteFormData = Omit<SalesNote, 'id' | 'userId' | 'createdAt'>;
