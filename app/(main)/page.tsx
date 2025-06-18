"use client";

import { useApp } from "@/contexts/app-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function Dashboard() {
  const { products, staff, transactions } = useApp();

  // Calculate stats
  const todayTransactions = transactions.filter(
    (t) => new Date(t.date).toDateString() === new Date().toDateString()
  );

  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const activeStaff = staff.filter((s) => s.status).length;
  const lowStockProducts = products.filter((p) => p.stock <= 10).length;

  const stats = [
    {
      title: "Total Penjualan Hari Ini",
      value: `Rp ${todayRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Transaksi Hari Ini",
      value: todayTransactions.length.toString(),
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Total Produk",
      value: products.length.toString(),
      change: `${lowStockProducts} stok rendah`,
      trend: lowStockProducts > 0 ? "down" : "up",
      icon: Package,
    },
    {
      title: "Petugas Aktif",
      value: activeStaff.toString(),
      change: "0%",
      trend: "neutral",
      icon: Users,
    },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" && (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                )}
                {stat.trend === "down" && (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    stat.trend === "up"
                      ? "text-green-500"
                      : stat.trend === "down"
                      ? "text-red-500"
                      : ""
                  }
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>Daftar transaksi terbaru hari ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transaksi</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Jumlah Item</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 5).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.id}
                  </TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{transaction.items.length} item</TableCell>
                  <TableCell className="font-medium">
                    Rp {transaction.total.toLocaleString()}
                  </TableCell>
                  <TableCell>{transaction.cashier}</TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleTimeString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Belum ada transaksi hari ini
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Transaksi Baru</CardTitle>
            <CardDescription>Mulai transaksi penjualan baru</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Kelola Produk</CardTitle>
            <CardDescription>Tambah atau edit produk</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Kelola Petugas</CardTitle>
            <CardDescription>Atur data petugas kasir</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
