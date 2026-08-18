"use client"

/**
 * Horizontal bar chart for admin analytics. Safe for all-zero or equal-value
 * series (no divide-by-zero: proportional heights, empty series renders
 * empty bars).
 */
export function ChartBar({
  data,
  height = 200,
}: {
  data: { label: string; value: number }[]
  height?: number
}) {
  const max = Math.max(0, ...data.map((d) => d.value))

  return (
    <div className="flex items-end gap-3" style={{ height }} aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2" title={`${d.label}: ${d.value}`}>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-primary/80"
              style={{ height: max === 0 ? 0 : `${Math.round((d.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500">{d.label}</span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="w-full text-center text-sm text-slate-500">No data</p>
      )}
    </div>
  )
}