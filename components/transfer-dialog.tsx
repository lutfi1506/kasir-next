"use client";

import { useState } from "react";
import { useApp } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Printer,
  FileText,
} from "lucide-react";
import { TransferReceipt } from "./transfer-receipt";
import { Product } from "@/lib/types";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  type: "in" | "out";
}

export function TransferDialog({
  open,
  onOpenChange,
  product,
  type,
}: TransferDialogProps) {
  const {
    addStockTransfer,
    addTransferReceipt,
    updateReceiptPrintCount,
    staff,
  } = useApp();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceiptId, setCurrentReceiptId] = useState<string | null>(null);

  const transferInReasons = [
    "Pembelian Barang",
    "Restocking",
    "Retur Supplier",
    "Koreksi Stok",
    "Transfer dari Cabang",
    "Hadiah/Bonus",
    "Lainnya",
  ];

  const transferOutReasons = [
    "Barang Rusak",
    "Expired",
    "Kehilangan",
    "Koreksi Stok",
    "Transfer ke Cabang",
    "Sampel Gratis",
    "Retur ke Supplier",
    "Lainnya",
  ];

  const reasons = type === "in" ? transferInReasons : transferOutReasons;
  const activeStaff = staff.filter((s) => s.status === true);

  const handleSubmit = () => {
    if (!quantity || !reason || !selectedStaff) return;

    const qty = Number.parseInt(quantity);
    if (qty <= 0) return;

    // Validate stock for transfer out
    if (type === "out" && qty > product.stock) {
      alert("Jumlah transfer out tidak boleh melebihi stok yang tersedia!");
      return;
    }

    const selectedStaffMember = staff.find((s) => s.id === selectedStaff);
    if (!selectedStaffMember) return;

    const stockBefore = product.stock;
    const stockAfter =
      type === "in" ? stockBefore + qty : Math.max(0, stockBefore - qty);

    const transferData = {
      productId: product.id,
      productName: product.name,
      type,
      quantity: qty,
      reason,
      notes: notes.trim() || undefined,
      date: new Date(),
      user: selectedStaffMember.name,
      userId: selectedStaffMember.id,
      stockBefore,
      stockAfter,
    };

    // Add transfer
    addStockTransfer(transferData);

    // Create receipt
    const receiptData = {
      transferId: `TF${Date.now()}`,
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        barcode: product.barcode,
      },
      type,
      quantity: qty,
      reason,
      notes: notes.trim() || undefined,
      date: new Date(),
      user: selectedStaffMember.name,
      staff: {
        id: selectedStaffMember.id,
        name: selectedStaffMember.name,
        role: selectedStaffMember.role,
        email: selectedStaffMember.email,
        phone: selectedStaffMember.phone,
      },
      stockBefore,
      stockAfter,
    };

    const receiptId = addTransferReceipt(receiptData);
    setCurrentReceiptId(receiptId);

    // Reset form
    setQuantity("");
    setReason("");
    setNotes("");
    setSelectedStaff("");

    // Show receipt
    setShowReceipt(true);
  };

  const handlePrint = () => {
    if (currentReceiptId) {
      updateReceiptPrintCount(currentReceiptId);
    }
    window.print();
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCurrentReceiptId(null);
    onOpenChange(false);
  };

  const newStock =
    type === "in"
      ? product.stock + Number.parseInt(quantity || "0")
      : Math.max(0, product.stock - Number.parseInt(quantity || "0"));

  if (showReceipt && currentReceiptId) {
    return (
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Laporan Transfer {type === "in" ? "In" : "Out"}
            </DialogTitle>
            <DialogDescription>
              Transfer berhasil diproses. Cetak laporan untuk dokumentasi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <TransferReceipt receiptId={currentReceiptId} />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Cetak Laporan
              </Button>
              <Button variant="outline" onClick={handleCloseReceipt}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "in" ? (
              <ArrowUp className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-600" />
            )}
            Transfer {type === "in" ? "In" : "Out"} - {product.name}
          </DialogTitle>
          <DialogDescription>
            {type === "in" ? "Tambah stok produk" : "Kurangi stok produk"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{product.name}</span>
              <Badge
                variant={
                  product.stock > 10
                    ? "default"
                    : product.stock > 0
                    ? "secondary"
                    : "destructive"
                }
              >
                Stok: {product.stock}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>

          {/* Staff Selection */}
          <div>
            <Label htmlFor="staff">Petugas yang Melakukan Transfer</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih petugas" />
              </SelectTrigger>
              <SelectContent>
                {activeStaff.map((staffMember) => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>
                    <div className="flex items-center gap-2">
                      <span>{staffMember.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {staffMember.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={type === "out" ? product.stock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Masukkan jumlah"
            />
            {type === "out" &&
              Number.parseInt(quantity || "0") > product.stock && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Jumlah melebihi stok tersedia</span>
                </div>
              )}
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Alasan</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih alasan transfer" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan"
              rows={3}
            />
          </div>

          {/* Stock Preview */}
          {quantity && Number.parseInt(quantity) > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Stok Sekarang:</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span>{type === "in" ? "Ditambah:" : "Dikurangi:"}</span>
                  <span
                    className={`font-medium ${
                      type === "in" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {type === "in" ? "+" : "-"}
                    {quantity}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span>Stok Setelah Transfer:</span>
                  <span className="font-bold">{newStock}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={
                !quantity ||
                !reason ||
                !selectedStaff ||
                Number.parseInt(quantity || "0") <= 0 ||
                (type === "out" &&
                  Number.parseInt(quantity || "0") > product.stock)
              }
            >
              Konfirmasi Transfer
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
