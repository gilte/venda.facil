
export interface SalesNote {
  id: string;
  customerName: string;
  customerAge: number;
  customerGender: 'Masculino' | 'Feminino' | 'Outro';
  productPurchased: string;
  purchaseAmount: number;
  paymentMethod: 'Cartão de Crédito' | 'Espécie';
  paymentStatus: 'À vista' | 'A prazo';
  installments?: number;
  createdAt: string; 
  user?: string; // Optional user field from backend
}

export type SalesNoteFormData = Omit<SalesNote, 'id' | 'createdAt' | 'user' >;

export interface User {
  id: string;
  name: string;
  email: string;
}
