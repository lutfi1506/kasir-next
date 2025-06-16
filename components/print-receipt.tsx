"use client"

interface PrintReceiptProps {
  transaction: {
    id: string
    items: Array<{
      product: {
        name: string
        price: number
      }
      quantity: number
    }>
    total: number
    customer: string
    date: Date
    cashier: string
    payment: number
    change: number
  }
}

export function PrintReceipt({ transaction }: PrintReceiptProps) {
  return (
    <div className="print-receipt bg-white p-4 text-black" style={{ fontFamily: "monospace" }}>
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">KASIR APP</h2>
        <p className="text-sm">Point of Sale System</p>
        <p className="text-xs">Jl. Contoh No. 123, Jakarta</p>
        <p className="text-xs">Telp: (021) 1234-5678</p>
        <div className="border-t border-dashed border-gray-400 my-2"></div>
      </div>

      <div className="mb-4 text-sm">
        <div className="flex justify-between">
          <span>No. Transaksi:</span>
          <span>{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span>{transaction.date.toLocaleDateString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{transaction.date.toLocaleTimeString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>{transaction.cashier}</span>
        </div>
        <div className="flex justify-between">
          <span>Pelanggan:</span>
          <span>{transaction.customer}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="mb-4">
        {transaction.items.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between text-sm">
              <span className="flex-1">{item.product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>
                {item.quantity} x Rp {item.product.price.toLocaleString()}
              </span>
              <span>Rp {(item.quantity * item.product.price).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="text-sm space-y-1">
        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>Rp {transaction.total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Bayar:</span>
          <span>Rp {transaction.payment.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembalian:</span>
          <span>Rp {transaction.change.toLocaleString()}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="text-center text-xs">
        <p>Terima kasih atas kunjungan Anda!</p>
        <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
        <p className="mt-2">Powered by Kasir App</p>
      </div>

      <style jsx>{`
        @media print {
          .print-receipt {
            width: 80mm;
            margin: 0;
            padding: 10px;
            font-size: 12px;
            line-height: 1.2;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-receipt, .print-receipt * {
            visibility: visible;
          }
          
          .print-receipt {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}
