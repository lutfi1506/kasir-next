"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback, // 1. Impor useCallback
} from "react";

import type {
  Product,
  Staff,
  CartItem,
  Transaction,
  StockTransfer,
  TransferReceipt,
} from "@/lib/types"; // Asumsi Anda sudah memindahkan tipe ke file terpisah

interface AppContextType {
  products: Product[];
  staff: Staff[];
  cart: CartItem[];
  transactions: Transaction[];
  stockTransfers: StockTransfer[];
  transferReceipts: TransferReceipt[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStaff: (staff: Omit<Staff, "id">) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  addStockTransfer: (transfer: Omit<StockTransfer, "id">) => void;
  addTransferReceipt: (
    receipt: Omit<TransferReceipt, "id" | "printedAt" | "printCount">
  ) => string;
  updateReceiptPrintCount: (receiptId: string) => void;
  getProductTransfers: (productId: string) => StockTransfer[];
  getTransferReceipt: (receiptId: string) => TransferReceipt | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Indomie Goreng",
      price: 3500,
      stock: 100,
      category_id: "1",
      categories: { name: "Makanan" },
      barcode: "8992388123456",
    },
    {
      id: "2",
      name: "Aqua 600ml",
      price: 3000,
      stock: 50,
      category_id: "2",
      categories: { name: "Minuman" },
      barcode: "8993675123456",
    },
    {
      id: "3",
      name: "Teh Botol Sosro",
      price: 4000,
      stock: 30,
      category_id: "2",
      categories: { name: "Minuman" },
      barcode: "8991234567890",
    },
    {
      id: "4",
      name: "Roti Tawar",
      price: 12000,
      stock: 20,
      category_id: "1",
      categories: { name: "Makanan" },
      barcode: "8995678901234",
    },
    {
      id: "5",
      name: "Kopi Kapal Api",
      price: 2500,
      stock: 75,
      category_id: "2",
      categories: { name: "Minuman" },
      barcode: "8991234567891",
    },
    {
      id: "6",
      name: "Mie Sedaap",
      price: 3200,
      stock: 80,
      category_id: "1",
      categories: { name: "Makanan" },
      barcode: "8992388123457",
    },
  ]);

  const [staff, setStaff] = useState<Staff[]>([
    {
      id: "1",
      name: "Admin Kasir",
      email: "admin@kasir.com",
      role: "admin",
      phone: "081234567890",
      status: true,
      user_id: "user-1",
    },
    {
      id: "2",
      name: "Siti Nurhaliza",
      email: "siti@kasir.com",
      role: "kasir",
      phone: "081234567891",
      status: true,
      user_id: "user-2",
    },
    {
      id: "3",
      name: "Budi Santoso",
      email: "budi@kasir.com",
      role: "kasir",
      phone: "081234567892",
      status: true,
      user_id: "user-3",
    },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [transferReceipts, setTransferReceipts] = useState<TransferReceipt[]>(
    []
  );

  // ... useEffect untuk generate data sampel (tidak perlu diubah) ...

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback(
    (id: string, updatedProduct: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p))
      );
    },
    []
  );

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addStaff = useCallback((staffMember: Omit<Staff, "id">) => {
    const newStaff = { ...staffMember, id: Date.now().toString() };
    setStaff((prev) => [...prev, newStaff]);
  }, []);

  const updateStaff = useCallback(
    (id: string, updatedStaff: Partial<Staff>) => {
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updatedStaff } : s))
      );
    },
    []
  );

  const deleteStaff = useCallback((id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id">) => {
      const newTransaction = { ...transaction, id: Date.now().toString() };
      setTransactions((prev) => [newTransaction, ...prev]);

      transaction.items.forEach((item) => {
        const product = products.find((p) => p.id === item.product.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          updateProduct(item.product.id, { stock: newStock });

          const transfer: StockTransfer = {
            id: `TF${Date.now()}-${item.product.id}`,
            productId: item.product.id,
            productName: item.product.name,
            type: "out",
            quantity: item.quantity,
            reason: "Penjualan",
            notes: `Transaksi: ${newTransaction.id}`,
            date: new Date(),
            user: transaction.cashier,
            stockBefore: product.stock,
            stockAfter: newStock,
          };
          setStockTransfers((prev) => [transfer, ...prev]);
        }
      });
    },
    [products, updateProduct]
  );

  const addStockTransfer = useCallback(
    (transfer: Omit<StockTransfer, "id">) => {
      const product = products.find((p) => p.id === transfer.productId);
      if (!product) return;

      const newTransfer: StockTransfer = {
        ...transfer,
        id: Date.now().toString(),
      };

      updateProduct(transfer.productId, { stock: transfer.stockAfter });
      setStockTransfers((prev) => [newTransfer, ...prev]);
    },
    [products, updateProduct]
  );

  const addTransferReceipt = useCallback(
    (receipt: Omit<TransferReceipt, "id" | "printedAt" | "printCount">) => {
      const receiptId = `RC${Date.now()}`;
      const newReceipt: TransferReceipt = {
        ...receipt,
        id: receiptId,
        printedAt: new Date(),
        printCount: 1,
      };

      setTransferReceipts((prev) => [newReceipt, ...prev]);
      return receiptId;
    },
    []
  );

  const updateReceiptPrintCount = useCallback((receiptId: string) => {
    setTransferReceipts((prev) =>
      prev.map((receipt) =>
        receipt.id === receiptId
          ? { ...receipt, printCount: receipt.printCount + 1 }
          : receipt
      )
    );
  }, []);

  const getProductTransfers = useCallback(
    (productId: string) => {
      return stockTransfers.filter(
        (transfer) => transfer.productId === productId
      );
    },
    [stockTransfers]
  );

  const getTransferReceipt = useCallback(
    (receiptId: string) => {
      return transferReceipts.find((receipt) => receipt.id === receiptId);
    },
    [transferReceipts]
  );

  return (
    <AppContext.Provider
      value={{
        products,
        staff,
        cart,
        transactions,
        stockTransfers,
        transferReceipts,
        addProduct,
        updateProduct,
        deleteProduct,
        addStaff,
        updateStaff,
        deleteStaff,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addTransaction,
        addStockTransfer,
        addTransferReceipt,
        updateReceiptPrintCount,
        getProductTransfers,
        getTransferReceipt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
