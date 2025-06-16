"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Users, Package, ShoppingCart, Heart, Code } from "lucide-react"

export function AboutPage() {
  const features = [
    {
      icon: ShoppingCart,
      title: "Penjualan",
      description: "Sistem penjualan dengan scanner barcode dan cetak struk otomatis",
    },
    {
      icon: Package,
      title: "Manajemen Produk",
      description: "Kelola produk, stok, harga, dan kategori dengan mudah",
    },
    {
      icon: Users,
      title: "Manajemen Petugas",
      description: "Atur data petugas dengan role dan permission yang berbeda",
    },
    {
      icon: Store,
      title: "Dashboard",
      description: "Pantau performa penjualan dan statistik bisnis real-time",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex aspect-square size-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-8" />
            </div>
          </div>
          <CardTitle className="text-3xl">Kasir App</CardTitle>
          <CardDescription className="text-lg">Aplikasi Point of Sale Modern untuk Bisnis Anda</CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">v1.0.0</Badge>
            <Badge variant="outline">React</Badge>
            <Badge variant="outline">Next.js</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Fitur Utama</CardTitle>
          <CardDescription>
            Kasir App dilengkapi dengan berbagai fitur untuk mendukung operasional bisnis Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Teknologi yang Digunakan</CardTitle>
          <CardDescription>Dibangun dengan teknologi modern dan terpercaya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Code className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Frontend</h3>
              <p className="text-sm text-muted-foreground">React, Next.js, TypeScript</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">UI Components</h3>
              <p className="text-sm text-muted-foreground">shadcn/ui, Tailwind CSS</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Store className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">State Management</h3>
              <p className="text-sm text-muted-foreground">React Context, Local Storage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Dibuat dengan ❤️
          </CardTitle>
          <CardDescription>
            Aplikasi ini dikembangkan untuk membantu bisnis kecil dan menengah dalam mengelola penjualan dengan lebih
            efisien.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Versi:</strong> 1.0.0
            </p>
            <p>
              <strong>Tanggal Rilis:</strong> {new Date().toLocaleDateString("id-ID")}
            </p>
            <p>
              <strong>Lisensi:</strong> MIT License
            </p>
            <p>
              <strong>Support:</strong> support@kasirapp.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
