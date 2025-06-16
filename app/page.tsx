"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Dashboard } from "@/components/dashboard"
import { PenjualanPage } from "@/components/penjualan-page"
import { ProdukPage } from "@/components/produk-page"
import { PetugasPage } from "@/components/petugas-page"
import { AboutPage } from "@/components/about-page"
import { LaporanPage } from "@/components/laporan-page"
import { TransferReceiptHistory } from "@/components/transfer-receipt-history"

export default function Page() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "penjualan":
        return <PenjualanPage />
      case "produk":
        return <ProdukPage />
      case "petugas":
        return <PetugasPage />
      case "about":
        return <AboutPage />
      case "laporan":
        return <LaporanPage />
      case "transfer-receipts":
        return <TransferReceiptHistory />
      default:
        return <Dashboard />
    }
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard"
      case "penjualan":
        return "Penjualan"
      case "produk":
        return "Kelola Produk"
      case "petugas":
        return "Kelola Petugas"
      case "about":
        return "Tentang Aplikasi"
      case "laporan":
        return "Laporan Penjualan"
      case "transfer-receipts":
        return "Riwayat Struk Transfer"
      default:
        return "Dashboard"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{renderPage()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
