"use client";

import { useState, useTransition } from "react";
import type {
  ActionResponse,
  Product,
  Staff,
  StockTransferPayload,
} from "@/lib/types"; // Pastikan Staff diimpor
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
import { ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";

// --- INI BAGIAN YANG DIPERBAIKI ---
interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  type: "in" | "out";
  activeStaff: Pick<Staff, "id" | "name">[]; // <-- PROPERTI INI DITAMBAHKAN
  onConfirm: (data: StockTransferPayload) => ActionResponse;
}

export function TransferDialog({
  open,
  onOpenChange,
  product,
  type,
  activeStaff,
  onConfirm,
}: TransferDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const transferInReasons = [
    "Pembelian Barang",
    "Restocking",
    "Retur Pelanggan",
    "Koreksi Stok",
    "Lainnya",
  ];
  const transferOutReasons = [
    "Barang Rusak",
    "Expired",
    "Kehilangan",
    "Koreksi Stok",
    "Retur ke Supplier",
    "Lainnya",
  ];
  const reasons = type === "in" ? transferInReasons : transferOutReasons;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuantity("");
      setReason("");
      setNotes("");
      setSelectedStaffId("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (!quantity || !reason || !selectedStaffId) {
      alert("Harap isi semua field yang wajib diisi.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Jumlah harus berupa angka positif.");
      return;
    }
    if (type === "out" && qty > product.stock) {
      alert("Jumlah transfer out tidak boleh melebihi stok yang tersedia!");
      return;
    }

    const selectedStaffMember = activeStaff.find(
      (s) => s.id === selectedStaffId
    );
    if (!selectedStaffMember) return;

    const transferData = {
      productId: product.id,
      productName: product.name,
      type,
      quantity: qty,
      reason,
      notes: notes.trim() || undefined,
      userId: selectedStaffMember.id,
      userName: selectedStaffMember.name,
    };

    startTransition(async () => {
      const result = await onConfirm(transferData);
      if (result?.error) {
        alert("Gagal melakukan transfer: " + result.error.message);
      } else {
        handleOpenChange(false);
      }
    });
  };

  const newStock =
    product.stock +
    (type === "in" ? parseInt(quantity || "0") : -parseInt(quantity || "0"));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        <div className="space-y-4 py-4">
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
          </div>

          <div>
            <Label htmlFor="staff">Petugas</Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih petugas" />
              </SelectTrigger>
              <SelectContent>
                {activeStaff.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Masukkan jumlah"
            />
            {type === "out" && parseInt(quantity || "0") > product.stock && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Jumlah melebihi stok</span>
              </div>
            )}
          </div>

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

          <div>
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan"
            />
          </div>

          {quantity && parseInt(quantity) > 0 && !isNaN(newStock) && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm space-y-1">
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
                  <span className="font-bold">Stok Setelah Transfer:</span>
                  <span className="font-bold">{newStock}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!quantity || !reason || !selectedStaffId || isPending}
            >
              {isPending ? "Memproses..." : "Konfirmasi Transfer"}
            </Button>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
