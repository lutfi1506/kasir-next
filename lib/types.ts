// lib/types.ts

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: "admin" | "kasir";
  phone: string;
  status: "aktif" | "nonaktif";
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  customer: string;
  date: Date;
  cashier: string;
  payment: number;
  change: number;
}

export interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  reason: string;
  notes?: string;
  date: Date;
  user: string;
  userId?: string;
  stockBefore: number;
  stockAfter: number;
}

export interface TransferReceipt {
  id: string;
  transferId: string;
  product: {
    id: string;
    name: string;
    category: string;
    barcode?: string;
  };
  type: "in" | "out";
  quantity: number;
  reason: string;
  notes?: string;
  date: Date;
  user: string;
  staff: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  stockBefore: number;
  stockAfter: number;
  printedAt: Date;
  printCount: number;
}

// Tipe untuk data laporan yang akan dicetak
export interface ReportData {
  period: string;
  stats: {
    totalRevenue?: number;
    totalTransactions?: number;
    totalItems?: number;
    avgTransaction?: number;
    transferIn?: number;
    transferOut?: number;
    totalTransfers?: number;
  };
  transactions?: Transaction[];
  transfers?: StockTransfer[];
  topProducts?: {
    product: Product;
    quantity: number;
    revenue: number;
  }[];
  dateGenerated: Date;
}

// Tipe untuk data yang dikirim ke komponen LaporanReceipt
export interface LaporanReceiptData {
  type: "daily" | "monthly" | "yearly" | "transfers";
  data: ReportData;
}
