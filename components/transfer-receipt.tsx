"use client"

import { useApp } from "@/contexts/app-context"

interface TransferReceiptProps {
  receiptId: string
}

export function TransferReceipt({ receiptId }: TransferReceiptProps) {
  const { getTransferReceipt } = useApp()
  const receipt = getTransferReceipt(receiptId)

  if (!receipt) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Struk transfer tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="transfer-receipt bg-white p-4 text-black" style={{ fontFamily: "monospace" }}>
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">KASIR APP</h2>
        <p className="text-sm">Point of Sale System</p>
        <p className="text-xs">Jl. Contoh No. 123, Jakarta</p>
        <p className="text-xs">Telp: (021) 1234-5678</p>
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        <h3 className="text-md font-bold">LAPORAN TRANSFER {receipt.type === "in" ? "IN" : "OUT"}</h3>
      </div>

      <div className="mb-4 text-sm">
        <div className="flex justify-between">
          <span>No. Struk:</span>
          <span>{receipt.id}</span>
        </div>
        <div className="flex justify-between">
          <span>No. Transfer:</span>
          <span>{receipt.transferId}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span>{receipt.date.toLocaleDateString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{receipt.date.toLocaleTimeString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Tipe Transfer:</span>
          <span className={receipt.type === "in" ? "text-green-600" : "text-red-600"}>
            {receipt.type === "in" ? "TRANSFER IN" : "TRANSFER OUT"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cetak ke-:</span>
          <span>{receipt.printCount}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="mb-4 text-sm">
        <h4 className="font-bold mb-2">INFORMASI PRODUK</h4>
        <div className="flex justify-between">
          <span>Nama Produk:</span>
          <span>{receipt.product.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Kategori:</span>
          <span>{receipt.product.category}</span>
        </div>
        {receipt.product.barcode && (
          <div className="flex justify-between">
            <span>Barcode:</span>
            <span>{receipt.product.barcode}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="mb-4 text-sm">
        <h4 className="font-bold mb-2">DETAIL TRANSFER</h4>
        <div className="flex justify-between">
          <span>Alasan:</span>
          <span>{receipt.reason}</span>
        </div>
        <div className="flex justify-between">
          <span>Jumlah:</span>
          <span className={`font-bold ${receipt.type === "in" ? "text-green-600" : "text-red-600"}`}>
            {receipt.type === "in" ? "+" : "-"}
            {receipt.quantity} item
          </span>
        </div>
        <div className="flex justify-between">
          <span>Stok Sebelum:</span>
          <span>{receipt.stockBefore} item</span>
        </div>
        <div className="flex justify-between">
          <span>Stok Setelah:</span>
          <span className="font-bold">{receipt.stockAfter} item</span>
        </div>
        {receipt.notes && (
          <div className="mt-2">
            <span>Catatan:</span>
            <div className="text-xs mt-1 p-2 bg-gray-100 rounded">{receipt.notes}</div>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="mb-4 text-sm">
        <h4 className="font-bold mb-2">PETUGAS</h4>
        <div className="flex justify-between">
          <span>Nama:</span>
          <span>{receipt.staff.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Role:</span>
          <span>{receipt.staff.role === "admin" ? "Administrator" : "Kasir"}</span>
        </div>
        <div className="flex justify-between">
          <span>Email:</span>
          <span>{receipt.staff.email}</span>
        </div>
        <div className="flex justify-between">
          <span>Telepon:</span>
          <span>{receipt.staff.phone}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="text-center text-xs">
        <p>Laporan ini dibuat secara otomatis</p>
        <p>oleh sistem Kasir App</p>
        <p className="mt-2">
          <strong>PENTING:</strong> Simpan laporan ini sebagai bukti transfer stok
        </p>
        <p className="mt-2">
          Dicetak: {receipt.printedAt.toLocaleDateString("id-ID")} {receipt.printedAt.toLocaleTimeString("id-ID")}
        </p>
        <p className="mt-1">Powered by Kasir App v1.0</p>
      </div>

      <style jsx>{`
        @media print {
          .transfer-receipt {
            width: 80mm;
            margin: 0;
            padding: 10px;
            font-size: 12px;
            line-height: 1.2;
          }

          body * {
            visibility: hidden;
          }

          .transfer-receipt,
          .transfer-receipt * {
            visibility: visible;
          }

          .transfer-receipt {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}
