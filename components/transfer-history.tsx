"use client";

import { useState, useEffect } from "react";
import type { ActionResponse, Product, StockTransfer } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Package,
} from "lucide-react";

// --- INI BAGIAN YANG DIPERBAIKI ---
interface TransferHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  fetchTransfers: () => ActionResponse<StockTransfer[]>;
}

export function TransferHistory({
  open,
  onOpenChange,
  product,
  fetchTransfers,
}: TransferHistoryProps) {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchTransfers().then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch transfer history:", error);
          alert("Gagal memuat riwayat transfer.");
        } else {
          setTransfers(data || []);
        }
        setLoading(false);
      });
    }
  }, [open, fetchTransfers]);

  const totalIn = transfers
    .filter((t) => t.type === "in")
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalOut = transfers
    .filter((t) => t.type === "out")
    .reduce((sum, t) => sum + t.quantity, 0);
  const netChange = totalIn - totalOut;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Riwayat Transfer - {product.name}
          </DialogTitle>
          <DialogDescription>
            Histori semua transfer in dan transfer out untuk produk ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total In</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{totalIn}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Out</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -{totalOut}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Change
                </CardTitle>
                {netChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    netChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {netChange >= 0 ? "+" : ""}
                  {netChange}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Stok Saat Ini
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{product.stock}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transfer ({transfers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8">Memuat data...</p>
              ) : transfers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada riwayat transfer</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead>Petugas</TableHead>
                      <TableHead>Stok (Sesudah)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(transfer.date).toLocaleDateString(
                                "id-ID"
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transfer.date).toLocaleTimeString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transfer.type === "in" ? "default" : "destructive"
                            }
                          >
                            {transfer.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              transfer.type === "in"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transfer.type === "in" ? "+" : "-"}
                            {transfer.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{transfer.reason}</TableCell>
                        <TableCell>{transfer.user || "N/A"}</TableCell>
                        <TableCell className="font-medium">
                          {transfer.stockAfter}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
