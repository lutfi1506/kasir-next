"use client";

import { useApp } from "@/contexts/app-context";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Package,
  Download,
} from "lucide-react";
import { Product } from "@/lib/types";

interface TransferHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function TransferHistory({
  open,
  onOpenChange,
  product,
}: TransferHistoryProps) {
  const { getProductTransfers } = useApp();
  const transfers = getProductTransfers(product.id);

  // Calculate summary stats
  const totalIn = transfers
    .filter((t) => t.type === "in")
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalOut = transfers
    .filter((t) => t.type === "out")
    .reduce((sum, t) => sum + t.quantity, 0);
  const netChange = totalIn - totalOut;

  const handleExportTransfers = () => {
    // Create CSV content
    const headers = [
      "Tanggal",
      "Waktu",
      "Tipe",
      "Jumlah",
      "Alasan",
      "Stok Sebelum",
      "Stok Setelah",
      "Petugas",
      "Catatan",
    ];
    const csvContent = [
      headers.join(","),
      ...transfers.map((t) =>
        [
          new Date(t.date).toLocaleDateString("id-ID"),
          new Date(t.date).toLocaleTimeString("id-ID"),
          t.type === "in" ? "Transfer In" : "Transfer Out",
          `${t.type === "in" ? "+" : "-"}${t.quantity}`,
          t.reason,
          t.stockBefore,
          t.stockAfter,
          t.user,
          t.notes || "",
        ].join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transfer-history-${product.name.replace(/\s+/g, "-")}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Riwayat Transfer - {product.name}
          </DialogTitle>
          <DialogDescription>
            Histori semua transfer in dan transfer out untuk produk ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transfer In
                </CardTitle>
                <ArrowUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{totalIn}
                </div>
                <p className="text-xs text-muted-foreground">item masuk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transfer Out
                </CardTitle>
                <ArrowDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -{totalOut}
                </div>
                <p className="text-xs text-muted-foreground">item keluar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                <p className="text-xs text-muted-foreground">
                  perubahan bersih
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Stok Saat Ini
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{product.stock}</div>
                <p className="text-xs text-muted-foreground">item tersedia</p>
              </CardContent>
            </Card>
          </div>

          {/* Transfer History Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Riwayat Transfer ({transfers.length})</CardTitle>
                  <CardDescription>
                    Daftar semua aktivitas transfer untuk produk {product.name}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportTransfers}
                  disabled={transfers.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transfers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada riwayat transfer untuk produk ini</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead>Stok Sebelum</TableHead>
                      <TableHead>Stok Setelah</TableHead>
                      <TableHead>Petugas</TableHead>
                      <TableHead>Catatan</TableHead>
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
                            className="flex items-center gap-1 w-fit"
                          >
                            {transfer.type === "in" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                            {transfer.type === "in" ? "IN" : "OUT"}
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
                        <TableCell>{transfer.stockBefore}</TableCell>
                        <TableCell className="font-medium">
                          {transfer.stockAfter}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transfer.user}</div>
                            {transfer.userId && (
                              <div className="text-xs text-muted-foreground">
                                ID: {transfer.userId}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transfer.notes ? (
                            <span className="text-sm text-muted-foreground">
                              {transfer.notes}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              -
                            </span>
                          )}
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
