export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  balance: number;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Service {
  id: string;
  platform: 'Instagram' | 'TikTok' | 'Facebook' | 'Twitter';
  name: string;
  description: string;
  pricePerUnit: number;
  minQuantity: number;
  maxQuantity: number;
  providerServiceId?: number;
}

export interface Order {
  id?: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  platform: string;
  targetUrl: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  providerOrderId?: string | number;
  createdAt: string;
}

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'abandoned_purchase' | 'deposit_success' | 'order_update' | 'system';
  amount?: number;
  orderId?: string;
  createdAt: string;
  read: boolean;
}
