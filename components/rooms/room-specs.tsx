"use client"

export function RoomSpecs({ specs }: { specs: Record<string, string> }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-card">
      <h4 className="mb-3 text-lg font-semibold text-slate-900">Room specifications</h4>
      <dl className="grid gap-2">
        {Object.entries(specs).map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm text-slate-700">
            <dt className="font-medium text-slate-600">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
