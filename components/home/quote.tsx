"use client"

export function QuoteSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <blockquote className="rounded-2xl bg-white/95 p-8 text-slate-800 shadow-card">
          <p className="font-serif text-2xl leading-relaxed">
            “Vanprastha felt like a pause: quiet architecture, warm attention and a restorative sense of space that lingered long after our stay.”
          </p>
          <footer className="mt-6 text-sm text-slate-600">— Anika Singh, Wellness Explorer</footer>
        </blockquote>
      </div>
    </section>
  )
}
