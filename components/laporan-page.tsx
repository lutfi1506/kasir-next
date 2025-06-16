"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart3,
  ArrowUp,
  ArrowDown,
  FileText,
} from "lucide-react"
import { LaporanChart } from "./laporan-chart"
import { LaporanReceipt } from "./laporan-receipt"

export function LaporanPage() {
  const { transactions, products, stockTransfers } = useApp()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)

  // Filter transactions for daily report
  const dailyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date).toISOString().split("T")[0]
      return transactionDate === selectedDate
    })
  }, [transactions, selectedDate])

  // Filter transactions for monthly report
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionMonth = new Date(transaction.date).toISOString().slice(0, 7)
      return transactionMonth === selectedMonth
    })
  }, [transactions, selectedMonth])

  // Filter transactions for yearly report
  const yearlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionYear = new Date(transaction.date).getFullYear().toString()
      return transactionYear === selectedYear
    })
  }, [transactions, selectedYear])

  // Filter stock transfers for daily report
  const dailyTransfers = useMemo(() => {
    return stockTransfers.filter((transfer) => {
      const transferDate = new Date(transfer.date).toISOString().split("T")[0]
      return transferDate === selectedDate
    })
  }, [stockTransfers, selectedDate])

  // Filter stock transfers for monthly report
  const monthlyTransfers = useMemo(() => {
    return stockTransfers.filter((transfer) => {
      const transferMonth = new Date(transfer.date).toISOString().slice(0, 7)
      return transferMonth === selectedMonth
    })
  }, [stockTransfers, selectedMonth])

  // Calculate daily stats
  const dailyStats = useMemo(() => {
    const totalRevenue = dailyTransactions.reduce((sum, t) => sum + t.total, 0)
    const totalTransactions = dailyTransactions.length
    const totalItems = dailyTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return {
      totalRevenue,
      totalTransactions,
      totalItems,
      avgTransaction,
    }
  }, [dailyTransactions])

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const totalRevenue = monthlyTransactions.reduce((sum, t) => sum + t.total, 0)
    const totalTransactions = monthlyTransactions.length
    const totalItems = monthlyTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Group by day for chart
    const dailyData = monthlyTransactions.reduce(
      (acc, transaction) => {
        const day = new Date(transaction.date).getDate()
        if (!acc[day]) {
          acc[day] = { day, revenue: 0, transactions: 0 }
        }
        acc[day].revenue += transaction.total
        acc[day].transactions += 1
        return acc
      },
      {} as Record<number, { day: number; revenue: number; transactions: number }>,
    )

    const chartData = Object.values(dailyData).sort((a, b) => a.day - b.day)

    return {
      totalRevenue,
      totalTransactions,
      totalItems,
      avgTransaction,
      chartData,
    }
  }, [monthlyTransactions])

  // Calculate yearly stats
  const yearlyStats = useMemo(() => {
    const totalRevenue = yearlyTransactions.reduce((sum, t) => sum + t.total, 0)
    const totalTransactions = yearlyTransactions.length
    const totalItems = yearlyTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Group by month for chart
    const monthlyData = yearlyTransactions.reduce(
      (acc, transaction) => {
        const month = new Date(transaction.date).getMonth() + 1
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, transactions: 0 }
        }
        acc[month].revenue += transaction.total
        acc[month].transactions += 1
        return acc
      },
      {} as Record<number, { month: number; revenue: number; transactions: number }>,
    )

    const chartData = Object.values(monthlyData).sort((a, b) => a.month - b.month)

    return {
      totalRevenue,
      totalTransactions,
      totalItems,
      avgTransaction,
      chartData,
    }
  }, [yearlyTransactions])

  // Top selling products
  const getTopProducts = (transactionList: any[]) => {
    const productSales = transactionList.reduce(
      (acc, transaction) => {
        transaction.items.forEach((item: any) => {
          const productId = item.product.id
          if (!acc[productId]) {
            acc[productId] = {
              product: item.product,
              quantity: 0,
              revenue: 0,
            }
          }
          acc[productId].quantity += item.quantity
          acc[productId].revenue += item.quantity * item.product.price
        })
        return acc
      },
      {} as Record<string, { product: any; quantity: number; revenue: number }>,
    )

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  const handlePrint = () => {
    window.print()
  }

  const handlePrintReceipt = (type: "daily" | "monthly" | "yearly" | "transfers") => {
    let reportData
    let period
    let stats
    let transactions
    let transfers
    let topProducts

    switch (type) {
      case "daily":
        period = new Date(selectedDate).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        stats = dailyStats
        transactions = dailyTransactions
        transfers = dailyTransfers
        topProducts = getTopProducts(dailyTransactions)
        break
      case "monthly":
        period = new Date(selectedMonth + "-01").toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
        })
        stats = monthlyStats
        transactions = monthlyTransactions
        transfers = monthlyTransfers
        topProducts = getTopProducts(monthlyTransactions)
        break
      case "yearly":
        period = `Tahun ${selectedYear}`
        stats = yearlyStats
        transactions = yearlyTransactions
        topProducts = getTopProducts(yearlyTransactions)
        break
      case "transfers":
        period = new Date(selectedDate).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        stats = {
          transferIn: dailyTransfers.filter((t) => t.type === "in").reduce((sum, t) => sum + t.quantity, 0),
          transferOut: dailyTransfers.filter((t) => t.type === "out").reduce((sum, t) => sum + t.quantity, 0),
          totalTransfers: dailyTransfers.length,
        }
        transfers = dailyTransfers
        break
    }

    reportData = {
      period,
      stats,
      transactions,
      transfers,
      topProducts,
      dateGenerated: new Date(),
    }

    setReceiptData({ type, data: reportData })
    setShowReceiptDialog(true)
  }

  const handleExport = (type: "daily" | "monthly" | "yearly") => {
    let data, filename

    switch (type) {
      case "daily":
        data = dailyTransactions
        filename = `laporan-harian-${selectedDate}.csv`
        break
      case "monthly":
        data = monthlyTransactions
        filename = `laporan-bulanan-${selectedMonth}.csv`
        break
      case "yearly":
        data = yearlyTransactions
        filename = `laporan-tahunan-${selectedYear}.csv`
        break
    }

    // Create CSV content
    const headers = ["ID Transaksi", "Tanggal", "Pelanggan", "Kasir", "Total", "Pembayaran", "Kembalian"]
    const csvContent = [
      headers.join(","),
      ...data.map((t) =>
        [t.id, new Date(t.date).toLocaleString("id-ID"), t.customer, t.cashier, t.total, t.payment, t.change].join(","),
      ),
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportTransfers = (type: "daily" | "monthly") => {
    let data, filename

    switch (type) {
      case "daily":
        data = dailyTransfers
        filename = `laporan-transfer-harian-${selectedDate}.csv`
        break
      case "monthly":
        data = monthlyTransfers
        filename = `laporan-transfer-bulanan-${selectedMonth}.csv`
        break
    }

    // Create CSV content
    const headers = [
      "ID Transfer",
      "Tanggal",
      "Waktu",
      "Produk",
      "Tipe",
      "Jumlah",
      "Alasan",
      "Stok Sebelum",
      "Stok Setelah",
      "Petugas",
      "Catatan",
    ]
    const csvContent = [
      headers.join(","),
      ...data.map((t) =>
        [
          t.id,
          new Date(t.date).toLocaleDateString("id-ID"),
          new Date(t.date).toLocaleTimeString("id-ID"),
          t.productName,
          t.type === "in" ? "Transfer In" : "Transfer Out",
          `${t.type === "in" ? "+" : "-"}${t.quantity}`,
          t.reason,
          t.stockBefore,
          t.stockAfter,
          t.user,
          t.notes || "",
        ].join(","),
      ),
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Laporan Penjualan</h2>
          <p className="text-muted-foreground">Analisis performa penjualan dan transfer stok</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Laporan Harian</TabsTrigger>
          <TabsTrigger value="monthly">Laporan Bulanan</TabsTrigger>
          <TabsTrigger value="yearly">Laporan Tahunan</TabsTrigger>
          <TabsTrigger value="transfers">Transfer Stok</TabsTrigger>
        </TabsList>

        {/* Daily Report */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Filter Tanggal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="daily-date">Pilih Tanggal</Label>
                  <Input
                    id="daily-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleExport("daily")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={() => handlePrintReceipt("daily")} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Struk
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {dailyStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyStats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">transaksi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Item Terjual</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyStats.totalItems}</div>
                <p className="text-xs text-muted-foreground">item</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transfer Stok</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyTransfers.length}</div>
                <p className="text-xs text-muted-foreground">aktivitas transfer</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Transaksi Harian</CardTitle>
              <CardDescription>
                Daftar semua transaksi pada tanggal {new Date(selectedDate).toLocaleDateString("id-ID")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{new Date(transaction.date).toLocaleTimeString("id-ID")}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{transaction.cashier}</TableCell>
                      <TableCell>{transaction.items.length} item</TableCell>
                      <TableCell className="font-medium">Rp {transaction.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {dailyTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada transaksi pada tanggal ini
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Daily Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Stok Hari Ini</CardTitle>
              <CardDescription>Aktivitas transfer in dan transfer out pada tanggal ini</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Petugas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{new Date(transfer.date).toLocaleTimeString("id-ID")}</TableCell>
                      <TableCell className="font-medium">{transfer.productName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={transfer.type === "in" ? "default" : "destructive"}
                          className="flex items-center gap-1 w-fit"
                        >
                          {transfer.type === "in" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {transfer.type === "in" ? "IN" : "OUT"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${transfer.type === "in" ? "text-green-600" : "text-red-600"}`}>
                          {transfer.type === "in" ? "+" : "-"}
                          {transfer.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{transfer.reason}</TableCell>
                      <TableCell>{transfer.user}</TableCell>
                    </TableRow>
                  ))}
                  {dailyTransfers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada transfer stok pada tanggal ini
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Products Daily */}
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Terjual</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTopProducts(dailyTransactions).map((item, index) => (
                    <TableRow key={item.product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          {item.product.name}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity} item</TableCell>
                      <TableCell className="font-medium">Rp {item.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {getTopProducts(dailyTransactions).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Tidak ada data produk
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Report */}
        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Filter Bulan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="monthly-date">Pilih Bulan</Label>
                  <Input
                    id="monthly-date"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleExport("monthly")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={() => handlePrintReceipt("monthly")} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Struk
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {monthlyStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedMonth + "-01").toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">transaksi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Item Terjual</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.totalItems}</div>
                <p className="text-xs text-muted-foreground">item</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transfer Stok</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyTransfers.length}</div>
                <p className="text-xs text-muted-foreground">aktivitas transfer</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Grafik Penjualan Harian
              </CardTitle>
              <CardDescription>Trend penjualan per hari dalam bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <LaporanChart data={monthlyStats.chartData} type="daily" />
            </CardContent>
          </Card>

          {/* Top Products Monthly */}
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Terjual</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTopProducts(monthlyTransactions).map((item, index) => (
                    <TableRow key={item.product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          {item.product.name}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity} item</TableCell>
                      <TableCell className="font-medium">Rp {item.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Report */}
        <TabsContent value="yearly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Filter Tahun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="yearly-select">Pilih Tahun</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleExport("yearly")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={() => handlePrintReceipt("yearly")} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Struk
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {yearlyStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Tahun {selectedYear}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{yearlyStats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">transaksi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Item Terjual</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{yearlyStats.totalItems}</div>
                <p className="text-xs text-muted-foreground">item</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp {Math.round(yearlyStats.avgTransaction).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">per transaksi</p>
              </CardContent>
            </Card>
          </div>

          {/* Yearly Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Grafik Penjualan Bulanan
              </CardTitle>
              <CardDescription>Trend penjualan per bulan dalam tahun {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <LaporanChart data={yearlyStats.chartData} type="monthly" />
            </CardContent>
          </Card>

          {/* Top Products Yearly */}
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris Tahun {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Terjual</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTopProducts(yearlyTransactions).map((item, index) => (
                    <TableRow key={item.product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          {item.product.name}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity} item</TableCell>
                      <TableCell className="font-medium">Rp {item.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Reports */}
        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Filter Transfer Stok
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transfer-daily-date">Laporan Harian</Label>
                  <div className="flex gap-2">
                    <Input
                      id="transfer-daily-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <Button onClick={() => handleExportTransfers("daily")}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="transfer-monthly-date">Laporan Bulanan</Label>
                  <div className="flex gap-2">
                    <Input
                      id="transfer-monthly-date"
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                    <Button onClick={() => handleExportTransfers("monthly")}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => handlePrintReceipt("transfers")} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Struk Transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transfer In Hari Ini</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{dailyTransfers.filter((t) => t.type === "in").reduce((sum, t) => sum + t.quantity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">item masuk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transfer Out Hari Ini</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -{dailyTransfers.filter((t) => t.type === "out").reduce((sum, t) => sum + t.quantity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">item keluar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transfer In Bulan Ini</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{monthlyTransfers.filter((t) => t.type === "in").reduce((sum, t) => sum + t.quantity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">item masuk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transfer Out Bulan Ini</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -{monthlyTransfers.filter((t) => t.type === "out").reduce((sum, t) => sum + t.quantity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">item keluar</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Stok Terbaru</CardTitle>
              <CardDescription>Aktivitas transfer stok terbaru dari semua produk</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Petugas</TableHead>
                    <TableHead>Stok Setelah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockTransfers.slice(0, 10).map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{new Date(transfer.date).toLocaleDateString("id-ID")}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transfer.date).toLocaleTimeString("id-ID")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{transfer.productName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={transfer.type === "in" ? "default" : "destructive"}
                          className="flex items-center gap-1 w-fit"
                        >
                          {transfer.type === "in" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {transfer.type === "in" ? "IN" : "OUT"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${transfer.type === "in" ? "text-green-600" : "text-red-600"}`}>
                          {transfer.type === "in" ? "+" : "-"}
                          {transfer.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{transfer.reason}</TableCell>
                      <TableCell>{transfer.user}</TableCell>
                      <TableCell className="font-medium">{transfer.stockAfter}</TableCell>
                    </TableRow>
                  ))}
                  {stockTransfers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Belum ada aktivitas transfer stok
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Print Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Struk Laporan{" "}
              {receiptData?.type === "daily"
                ? "Harian"
                : receiptData?.type === "monthly"
                  ? "Bulanan"
                  : receiptData?.type === "yearly"
                    ? "Tahunan"
                    : "Transfer"}
            </DialogTitle>
            <DialogDescription>
              Preview struk laporan sebelum dicetak. Klik "Cetak" untuk mencetak struk.
            </DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4">
              <LaporanReceipt type={receiptData.type} data={receiptData.data} />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    window.print()
                    setShowReceiptDialog(false)
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Struk
                </Button>
                <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
