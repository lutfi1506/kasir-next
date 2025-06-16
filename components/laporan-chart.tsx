"use client"

import { useMemo } from "react"

interface ChartData {
  day?: number
  month?: number
  revenue: number
  transactions: number
}

interface LaporanChartProps {
  data: ChartData[]
  type: "daily" | "monthly"
}

export function LaporanChart({ data, type }: LaporanChartProps) {
  const maxRevenue = useMemo(() => {
    return Math.max(...data.map((d) => d.revenue), 0)
  }, [data])

  const getLabel = (item: ChartData) => {
    if (type === "daily") {
      return item.day?.toString() || "0"
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
      return months[(item.month || 1) - 1]
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p>Tidak ada data untuk ditampilkan</p>
          <p className="text-sm">Pilih periode yang memiliki transaksi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-64 flex items-end justify-between gap-2 border-b border-l pl-4 pb-4">
        {data.map((item, index) => {
          const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 200 : 0
          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative group">
                <div
                  className="bg-primary rounded-t-sm min-h-[4px] w-full transition-all hover:bg-primary/80 cursor-pointer"
                  style={{ height: `${height}px` }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  <div>Revenue: Rp {item.revenue.toLocaleString()}</div>
                  <div>Transaksi: {item.transactions}</div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{getLabel(item)}</span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span>Revenue (Rp)</span>
        </div>
        <div className="text-muted-foreground">{type === "daily" ? "Per Hari" : "Per Bulan"}</div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            Rp {data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {data.reduce((sum, item) => sum + item.transactions, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Transaksi</div>
        </div>
      </div>
    </div>
  )
}
