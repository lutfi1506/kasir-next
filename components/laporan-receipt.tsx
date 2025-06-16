"use client"

interface LaporanReceiptProps {
  type: "daily" | "monthly" | "yearly" | "transfers"
  data: {
    period: string
    stats: {
      totalRevenue?: number
      totalTransactions?: number
      totalItems?: number
      avgTransaction?: number
      transferIn?: number
      transferOut?: number
      totalTransfers?: number
    }
    transactions?: any[]
    transfers?: any[]
    topProducts?: any[]
    dateGenerated: Date
  }
}

export function LaporanReceipt({ type, data }: LaporanReceiptProps) {
  const getTitle = () => {
    switch (type) {
      case "daily":
        return "LAPORAN PENJUALAN HARIAN"
      case "monthly":
        return "LAPORAN PENJUALAN BULANAN"
      case "yearly":
        return "LAPORAN PENJUALAN TAHUNAN"
      case "transfers":
        return "LAPORAN TRANSFER STOK"
      default:
        return "LAPORAN PENJUALAN"
    }
  }

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString()}`

  return (
    <div className="laporan-receipt bg-white p-6 text-black" style={{ fontFamily: "monospace" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">KASIR APP</h1>
        <p className="text-sm">Point of Sale System</p>
        <p className="text-xs">Jl. Contoh No. 123, Jakarta</p>
        <p className="text-xs">Telp: (021) 1234-5678</p>
        <p className="text-xs">Email: info@kasirapp.com</p>
        <div className="border-t border-dashed border-gray-400 my-3"></div>
        <h2 className="text-lg font-bold">{getTitle()}</h2>
        <p className="text-sm font-medium">Periode: {data.period}</p>
      </div>

      {/* Report Info */}
      <div className="mb-6 text-sm">
        <div className="flex justify-between">
          <span>Tanggal Cetak:</span>
          <span>{data.dateGenerated.toLocaleDateString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu Cetak:</span>
          <span>{data.dateGenerated.toLocaleTimeString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Dicetak Oleh:</span>
          <span>Admin Kasir</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-4"></div>

      {/* Statistics Section */}
      <div className="mb-6">
        <h3 className="text-md font-bold mb-3">RINGKASAN STATISTIK</h3>

        {type !== "transfers" ? (
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Total Penjualan:</span>
              <span className="font-bold">{formatCurrency(data.stats.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Transaksi:</span>
              <span className="font-bold">{data.stats.totalTransactions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Item Terjual:</span>
              <span className="font-bold">{data.stats.totalItems || 0} item</span>
            </div>
            <div className="flex justify-between">
              <span>Rata-rata per Transaksi:</span>
              <span className="font-bold">{formatCurrency(data.stats.avgTransaction || 0)}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Total Transfer In:</span>
              <span className="font-bold text-green-600">+{data.stats.transferIn || 0} item</span>
            </div>
            <div className="flex justify-between">
              <span>Total Transfer Out:</span>
              <span className="font-bold text-red-600">-{data.stats.transferOut || 0} item</span>
            </div>
            <div className="flex justify-between">
              <span>Total Aktivitas Transfer:</span>
              <span className="font-bold">{data.stats.totalTransfers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Net Change:</span>
              <span className="font-bold">
                {(data.stats.transferIn || 0) - (data.stats.transferOut || 0) >= 0 ? "+" : ""}
                {(data.stats.transferIn || 0) - (data.stats.transferOut || 0)} item
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-4"></div>

      {/* Top Products Section (for sales reports) */}
      {type !== "transfers" && data.topProducts && data.topProducts.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-md font-bold mb-3">PRODUK TERLARIS</h3>
            <div className="text-sm">
              {data.topProducts.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between mb-1">
                  <span>
                    #{index + 1}. {item.product.name}
                  </span>
                  <span>{item.quantity} item</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-dashed border-gray-400 my-4"></div>
        </>
      )}

      {/* Transactions Detail (for daily reports) */}
      {type === "daily" && data.transactions && data.transactions.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-md font-bold mb-3">DETAIL TRANSAKSI</h3>
            <div className="text-xs">
              {data.transactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="mb-2 pb-1 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span>{transaction.id}</span>
                    <span>{formatCurrency(transaction.total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{transaction.customer}</span>
                    <span>{new Date(transaction.date).toLocaleTimeString("id-ID")}</span>
                  </div>
                </div>
              ))}
              {data.transactions.length > 10 && (
                <p className="text-center text-gray-600 mt-2">
                  ... dan {data.transactions.length - 10} transaksi lainnya
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-dashed border-gray-400 my-4"></div>
        </>
      )}

      {/* Transfers Detail (for transfer reports) */}
      {type === "transfers" && data.transfers && data.transfers.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-md font-bold mb-3">DETAIL TRANSFER STOK</h3>
            <div className="text-xs">
              {data.transfers.slice(0, 15).map((transfer, index) => (
                <div key={index} className="mb-2 pb-1 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span>{transfer.productName}</span>
                    <span className={transfer.type === "in" ? "text-green-600" : "text-red-600"}>
                      {transfer.type === "in" ? "+" : "-"}
                      {transfer.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{transfer.reason}</span>
                    <span>{new Date(transfer.date).toLocaleTimeString("id-ID")}</span>
                  </div>
                  <div className="text-gray-600">
                    <span>Petugas: {transfer.user}</span>
                  </div>
                </div>
              ))}
              {data.transfers.length > 15 && (
                <p className="text-center text-gray-600 mt-2">... dan {data.transfers.length - 15} transfer lainnya</p>
              )}
            </div>
          </div>
          <div className="border-t border-dashed border-gray-400 my-4"></div>
        </>
      )}

      {/* Summary Section */}
      <div className="mb-6">
        <h3 className="text-md font-bold mb-3">KESIMPULAN</h3>
        <div className="text-sm">
          {type !== "transfers" ? (
            <>
              <p>
                • Periode {data.period} mencatat total penjualan sebesar {formatCurrency(data.stats.totalRevenue || 0)}
              </p>
              <p>
                • Terdapat {data.stats.totalTransactions || 0} transaksi dengan rata-rata{" "}
                {formatCurrency(data.stats.avgTransaction || 0)} per transaksi
              </p>
              <p>• Total {data.stats.totalItems || 0} item berhasil terjual dalam periode ini</p>
              {data.topProducts && data.topProducts.length > 0 && (
                <p>
                  • Produk terlaris: {data.topProducts[0]?.product.name} ({data.topProducts[0]?.quantity} item)
                </p>
              )}
            </>
          ) : (
            <>
              <p>
                • Periode {data.period} mencatat {data.stats.totalTransfers || 0} aktivitas transfer stok
              </p>
              <p>
                • Transfer In: +{data.stats.transferIn || 0} item, Transfer Out: -{data.stats.transferOut || 0} item
              </p>
              <p>
                • Net change: {(data.stats.transferIn || 0) - (data.stats.transferOut || 0) >= 0 ? "+" : ""}
                {(data.stats.transferIn || 0) - (data.stats.transferOut || 0)} item
              </p>
              <p>• Aktivitas transfer membantu menjaga keseimbangan stok produk</p>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-4"></div>

      {/* Footer */}
      <div className="text-center text-xs">
        <p>Laporan ini dibuat secara otomatis oleh sistem Kasir App</p>
        <p>Untuk informasi lebih lanjut hubungi: admin@kasirapp.com</p>
        <p className="mt-2">
          <strong>CONFIDENTIAL:</strong> Dokumen ini bersifat rahasia dan hanya untuk internal perusahaan
        </p>
        <p className="mt-2">Powered by Kasir App v1.0 - Professional POS System</p>
      </div>

      <style jsx>{`
        @media print {
          .laporan-receipt {
            width: 210mm;
            margin: 0;
            padding: 20mm;
            font-size: 12px;
            line-height: 1.4;
          }
          
          body * {
            visibility: hidden;
          }
          
          .laporan-receipt, .laporan-receipt * {
            visibility: visible;
          }
          
          .laporan-receipt {
            position: absolute;
            left: 0;
            top: 0;
          }
          
          .border-dashed {
            border-style: dashed !important;
          }
        }
      `}</style>
    </div>
  )
}
