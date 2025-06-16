"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Product,
  Staff,
  CartItem,
  Transaction,
  StockTransfer,
  TransferReceipt,
} from "@/lib/types";

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
      category: "Makanan",
      barcode: "8992388123456",
    },
    {
      id: "2",
      name: "Aqua 600ml",
      price: 3000,
      stock: 50,
      category: "Minuman",
      barcode: "8993675123456",
    },
    {
      id: "3",
      name: "Teh Botol Sosro",
      price: 4000,
      stock: 30,
      category: "Minuman",
      barcode: "8991234567890",
    },
    {
      id: "4",
      name: "Roti Tawar",
      price: 12000,
      stock: 20,
      category: "Makanan",
      barcode: "8995678901234",
    },
    {
      id: "5",
      name: "Kopi Kapal Api",
      price: 2500,
      stock: 75,
      category: "Minuman",
      barcode: "8991234567891",
    },
    {
      id: "6",
      name: "Mie Sedaap",
      price: 3200,
      stock: 80,
      category: "Makanan",
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
      status: "aktif",
    },
    {
      id: "2",
      name: "Siti Nurhaliza",
      email: "siti@kasir.com",
      role: "kasir",
      phone: "081234567891",
      status: "aktif",
    },
    {
      id: "3",
      name: "Budi Santoso",
      email: "budi@kasir.com",
      role: "kasir",
      phone: "081234567892",
      status: "aktif",
    },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [transferReceipts, setTransferReceipts] = useState<TransferReceipt[]>(
    []
  );

  // Generate sample transactions and transfers for demo
  useEffect(() => {
    const generateSampleTransactions = () => {
      const sampleTransactions: Transaction[] = [];
      const customers = [
        "Ahmad Rizki",
        "Siti Nurhaliza",
        "Budi Santoso",
        "Maya Sari",
        "Dedi Kurniawan",
        "Rina Sari",
        "Joko Widodo",
        "Ani Susanti",
      ];

      // Generate transactions for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Generate 2-8 transactions per day
        const transactionsPerDay = Math.floor(Math.random() * 7) + 2;

        for (let j = 0; j < transactionsPerDay; j++) {
          const transactionDate = new Date(date);
          transactionDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM
          transactionDate.setMinutes(Math.floor(Math.random() * 60));

          const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
          const items: CartItem[] = [];
          let total = 0;

          for (let k = 0; k < numItems; k++) {
            const product =
              products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity

            items.push({ product, quantity });
            total += product.price * quantity;
          }

          const payment = total + Math.floor(Math.random() * 50000); // Add some extra for change

          sampleTransactions.push({
            id: `TRX${Date.now()}-${i}-${j}`,
            items,
            total,
            customer: customers[Math.floor(Math.random() * customers.length)],
            date: transactionDate,
            cashier: staff[Math.floor(Math.random() * staff.length)].name,
            payment,
            change: payment - total,
          });
        }
      }

      return sampleTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    };

    // Generate sample stock transfers and receipts
    const generateSampleTransfers = () => {
      const sampleTransfers: StockTransfer[] = [];
      const sampleReceipts: TransferReceipt[] = [];
      const reasons = {
        in: [
          "Pembelian Barang",
          "Restocking",
          "Retur Supplier",
          "Koreksi Stok",
          "Transfer dari Cabang",
        ],
        out: [
          "Barang Rusak",
          "Expired",
          "Kehilangan",
          "Koreksi Stok",
          "Transfer ke Cabang",
          "Sampel Gratis",
        ],
      };

      // Generate transfers for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Generate 1-3 transfers per day
        const transfersPerDay = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < transfersPerDay; j++) {
          const transferDate = new Date(date);
          transferDate.setHours(Math.floor(Math.random() * 12) + 8);
          transferDate.setMinutes(Math.floor(Math.random() * 60));

          const product = products[Math.floor(Math.random() * products.length)];
          const type = Math.random() > 0.6 ? "in" : "out"; // 60% in, 40% out
          const quantity = Math.floor(Math.random() * 20) + 1;
          const reasonList = reasons[type];
          const reason =
            reasonList[Math.floor(Math.random() * reasonList.length)];
          const staffMember = staff[Math.floor(Math.random() * staff.length)];

          const stockBefore = product.stock;
          const stockAfter =
            type === "in"
              ? stockBefore + quantity
              : Math.max(0, stockBefore - quantity);

          const transferId = `TF${Date.now()}-${i}-${j}`;
          const receiptId = `RC${Date.now()}-${i}-${j}`;

          // Create transfer
          sampleTransfers.push({
            id: transferId,
            productId: product.id,
            productName: product.name,
            type,
            quantity,
            reason,
            notes:
              Math.random() > 0.7
                ? "Catatan tambahan untuk transfer ini"
                : undefined,
            date: transferDate,
            user: staffMember.name,
            userId: staffMember.id,
            stockBefore,
            stockAfter,
          });

          // Create receipt
          sampleReceipts.push({
            id: receiptId,
            transferId: transferId,
            product: {
              id: product.id,
              name: product.name,
              category: product.category,
              barcode: product.barcode,
            },
            type,
            quantity,
            reason,
            notes:
              Math.random() > 0.7
                ? "Catatan tambahan untuk transfer ini"
                : undefined,
            date: transferDate,
            user: staffMember.name,
            staff: {
              id: staffMember.id,
              name: staffMember.name,
              role: staffMember.role,
              email: staffMember.email,
              phone: staffMember.phone,
            },
            stockBefore,
            stockAfter,
            printedAt: transferDate,
            printCount: Math.floor(Math.random() * 3) + 1, // 1-3 prints
          });
        }
      }

      return {
        transfers: sampleTransfers.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        receipts: sampleReceipts.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };
    };

    // Only generate sample data if no transactions exist
    if (transactions.length === 0) {
      setTransactions(generateSampleTransactions());
    }

    // Only generate sample transfers if none exist
    if (stockTransfers.length === 0) {
      const { transfers, receipts } = generateSampleTransfers();
      setStockTransfers(transfers);
      setTransferReceipts(receipts);
    }
  }, [products, staff, transactions.length, stockTransfers.length]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addStaff = (staffMember: Omit<Staff, "id">) => {
    const newStaff = { ...staffMember, id: Date.now().toString() };
    setStaff((prev) => [...prev, newStaff]);
  };

  const updateStaff = (id: string, updatedStaff: Partial<Staff>) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedStaff } : s))
    );
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const addToCart = (product: Product, quantity: number) => {
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
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions((prev) => [newTransaction, ...prev]);

    // Update stock and create transfer records for sales
    transaction.items.forEach((item) => {
      const product = products.find((p) => p.id === item.product.id);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        updateProduct(item.product.id, { stock: newStock });

        // Create transfer out record for sale
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
  };

  const addStockTransfer = (transfer: Omit<StockTransfer, "id">) => {
    const product = products.find((p) => p.id === transfer.productId);
    if (!product) return;

    const newTransfer: StockTransfer = {
      ...transfer,
      id: Date.now().toString(),
    };

    // Update product stock
    updateProduct(transfer.productId, { stock: transfer.stockAfter });

    // Add transfer record
    setStockTransfers((prev) => [newTransfer, ...prev]);
  };

  const addTransferReceipt = (
    receipt: Omit<TransferReceipt, "id" | "printedAt" | "printCount">
  ) => {
    const receiptId = `RC${Date.now()}`;
    const newReceipt: TransferReceipt = {
      ...receipt,
      id: receiptId,
      printedAt: new Date(),
      printCount: 1,
    };

    setTransferReceipts((prev) => [newReceipt, ...prev]);
    return receiptId;
  };

  const updateReceiptPrintCount = (receiptId: string) => {
    setTransferReceipts((prev) =>
      prev.map((receipt) =>
        receipt.id === receiptId
          ? { ...receipt, printCount: receipt.printCount + 1 }
          : receipt
      )
    );
  };

  const getProductTransfers = (productId: string) => {
    return stockTransfers.filter(
      (transfer) => transfer.productId === productId
    );
  };

  const getTransferReceipt = (receiptId: string) => {
    return transferReceipts.find((receipt) => receipt.id === receiptId);
  };

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
