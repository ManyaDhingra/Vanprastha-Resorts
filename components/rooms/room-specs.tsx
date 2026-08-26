export function RoomSpecs({ specs }: { specs: Record<string, string> }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
      <h4 className="mb-3 text-lg font-semibold text-text">Room specifications</h4>
      <dl className="grid gap-2">
        {Object.entries(specs).map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm text-text-muted">
            <dt className="font-medium text-text-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

