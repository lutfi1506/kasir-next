// app/(main)/penjualan/client-page.tsx
"use client";

import { useState, useMemo, useTransition } from "react";
import type { Product, CartItem, Transaction } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";
import { processTransaction } from "./actions";
import type { User } from "@supabase/supabase-js";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Printer,
} from "lucide-react";
import { PrintReceipt } from "@/components/print-receipt";
import ProductCard from "@/components/product-card";

export default function PenjualanClientPage({
  initialProducts,
  user,
}: {
  initialProducts: Product[];
  user: User | null;
}) {
  const [products] = useState(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("Pelanggan");
  const [payment, setPayment] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const debounceSearchTerm = useDebounce(searchTerm, 300);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debounceSearchTerm.toLowerCase()) ||
          product.barcode?.includes(debounceSearchTerm)
      ),
    [products, debounceSearchTerm]
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const paymentAmount = Number.parseFloat(payment) || 0;
  const change = paymentAmount - cartTotal;

  // --- Fungsi Keranjang ---
  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  item.product.stock
                ),
              }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("Pelanggan");
    setPayment("");
  };

  // --- Fungsi Checkout ---
  const handleCheckout = () => {
    if (
      cart.length === 0 ||
      paymentAmount < cartTotal ||
      !customerName.trim()
    ) {
      alert("Pastikan keranjang tidak kosong dan pembayaran cukup.");
      return;
    }

    startTransition(async () => {
      const payload = {
        cart,
        customer: customerName,
        payment: paymentAmount,
        total: cartTotal,
        change,
        cashierName: user?.user_metadata?.full_name || "Kasir",
      };
      const result = await processTransaction(payload);

      if (result.success && result.transactionId) {
        const transactionForReceipt: Transaction = {
          id: result.transactionId,
          items: cart,
          total: cartTotal,
          customer: customerName,
          date: new Date(),
          cashier: user?.user_metadata?.full_name || "Kasir",
          payment: paymentAmount,
          change,
        };
        setLastTransaction(transactionForReceipt);
        setShowReceipt(true);
        clearCart();
      } else {
        alert(`Transaksi Gagal: ${result.message}`);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Pilih Produk</CardTitle>
            <CardDescription>
              Cari dan pilih produk untuk ditambahkan ke keranjang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk atau scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => addToCart(p, 1)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Keranjang ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Keranjang kosong
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Rp {item.product.price.toLocaleString()} x{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer">Nama Pelanggan</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama pelanggan"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold text-lg">
                  Rp {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="payment">Jumlah Bayar</Label>
              <Input
                id="payment"
                type="number"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                placeholder="0"
              />
            </div>
            {paymentAmount > 0 && (
              <div className="flex justify-between text-lg font-bold">
                <span>Kembalian:</span>
                <span
                  className={change >= 0 ? "text-green-600" : "text-red-600"}
                >
                  Rp {change.toLocaleString()}
                </span>
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={
                isPending ||
                cart.length === 0 ||
                paymentAmount < cartTotal ||
                !customerName.trim()
              }
            >
              {isPending ? "Memproses..." : "Proses Pembayaran"}
            </Button>
            {cart.length > 0 && (
              <Button variant="outline" className="w-full" onClick={clearCart}>
                Kosongkan Keranjang
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaksi Berhasil</DialogTitle>
            <DialogDescription>
              Transaksi telah berhasil diproses. Cetak struk untuk pelanggan.
            </DialogDescription>
          </DialogHeader>
          {lastTransaction && (
            <div className="space-y-4">
              <PrintReceipt transaction={lastTransaction} />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Struk
                </Button>
                <Button variant="outline" onClick={() => setShowReceipt(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
