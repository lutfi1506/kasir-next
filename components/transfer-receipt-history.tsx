"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Printer, Download, ArrowUp, ArrowDown, FileText } from "lucide-react"
import { TransferReceipt } from "./transfer-receipt"

export function TransferReceiptHistory() {
  const { transferReceipts, updateReceiptPrintCount } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "in" | "out">("all")
  const [filterDate, setFilterDate] = useState("")
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter receipts
  const filteredReceipts = transferReceipts.filter((receipt) => {
    const matchesSearch =
      receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || receipt.type === filterType

    const matchesDate = !filterDate || receipt.date.toISOString().split("T")[0] === filterDate

    return matchesSearch && matchesType && matchesDate
  })

  const handleViewReceipt = (receiptId: string) => {
    setSelectedReceiptId(receiptId)
    setIsViewDialogOpen(true)
  }

  const handlePrintReceipt = (receiptId: string) => {
    setSelectedReceiptId(receiptId)
    updateReceiptPrintCount(receiptId)
    // Small delay to ensure state is updated before printing
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const handleExportReceipts = () => {
    // Create CSV content
    const headers = [
      "No. Struk",
      "No. Transfer",
      "Tanggal",
      "Waktu",
      "Produk",
      "Tipe",
      "Jumlah",
      "Alasan",
      "Stok Sebelum",
      "Stok Setelah",
      "Petugas",
      "Jumlah Cetak",
      "Catatan",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredReceipts.map((r) =>
        [
          r.id,
          r.transferId,
          r.date.toLocaleDateString("id-ID"),
          r.date.toLocaleTimeString("id-ID"),
          r.product.name,
          r.type === "in" ? "Transfer In" : "Transfer Out",
          `${r.type === "in" ? "+" : "-"}${r.quantity}`,
          r.reason,
          r.stockBefore,
          r.stockAfter,
          r.staff.name,
          r.printCount,
          r.notes || "",
        ].join(","),
      ),
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `riwayat-struk-transfer-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Riwayat Struk Transfer</h2>
          <p className="text-muted-foreground">Lihat dan cetak ulang semua struk transfer yang pernah dibuat</p>
        </div>
        <Button onClick={handleExportReceipts} disabled={filteredReceipts.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Cari Struk</Label>
              <Input
                id="search"
                placeholder="No. struk, produk, petugas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type-filter">Tipe Transfer</Label>
              <Select value={filterType} onValueChange={(value: "all" | "in" | "out") => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="in">Transfer In</SelectItem>
                  <SelectItem value="out">Transfer Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-filter">Tanggal</Label>
              <Input id="date-filter" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterType("all")
                  setFilterDate("")
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Struk</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReceipts.length}</div>
            <p className="text-xs text-muted-foreground">struk transfer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer In</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredReceipts.filter((r) => r.type === "in").length}
            </div>
            <p className="text-xs text-muted-foreground">struk masuk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer Out</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredReceipts.filter((r) => r.type === "out").length}
            </div>
            <p className="text-xs text-muted-foreground">struk keluar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cetak</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReceipts.reduce((sum, r) => sum + r.printCount, 0)}</div>
            <p className="text-xs text-muted-foreground">kali cetak</p>
          </CardContent>
        </Card>
      </div>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Struk Transfer ({filteredReceipts.length})</CardTitle>
          <CardDescription>Klik "Lihat" untuk melihat detail struk atau "Cetak" untuk mencetak ulang</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada struk transfer ditemukan</p>
              <p className="text-sm">Coba ubah filter pencarian Anda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Struk</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Petugas</TableHead>
                  <TableHead>Cetak</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono text-sm">{receipt.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{receipt.date.toLocaleDateString("id-ID")}</div>
                        <div className="text-sm text-muted-foreground">{receipt.date.toLocaleTimeString("id-ID")}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{receipt.product.name}</div>
                        <div className="text-sm text-muted-foreground">{receipt.product.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={receipt.type === "in" ? "default" : "destructive"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {receipt.type === "in" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {receipt.type === "in" ? "IN" : "OUT"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${receipt.type === "in" ? "text-green-600" : "text-red-600"}`}>
                        {receipt.type === "in" ? "+" : "-"}
                        {receipt.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{receipt.reason}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{receipt.staff.name}</div>
                        <div className="text-sm text-muted-foreground">{receipt.staff.role}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{receipt.printCount}x</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewReceipt(receipt.id)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePrintReceipt(receipt.id)}>
                          <Printer className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Receipt Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detail Struk Transfer
            </DialogTitle>
            <DialogDescription>Lihat detail lengkap struk transfer</DialogDescription>
          </DialogHeader>
          {selectedReceiptId && (
            <div className="space-y-4">
              <TransferReceipt receiptId={selectedReceiptId} />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handlePrintReceipt(selectedReceiptId)
                    setIsViewDialogOpen(false)
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Ulang
                </Button>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden receipt for printing */}
      {selectedReceiptId && (
        <div className="hidden print:block">
          <TransferReceipt receiptId={selectedReceiptId} />
        </div>
      )}
    </div>
  )
}
