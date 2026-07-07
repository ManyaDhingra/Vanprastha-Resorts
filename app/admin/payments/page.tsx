"use client"

export default function AdminPayments() {
  const items = [
    { id: 'P-1001', amount: '₹42,000', status: 'Settled' },
    { id: 'P-1002', amount: '₹58,000', status: 'Pending' }
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Payments</h1>
      </div>

      <div className="grid gap-4">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-card flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">{p.id}</div>
              <div className="text-xs text-slate-600">{p.status}</div>
            </div>
            <div className="font-semibold">{p.amount}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
