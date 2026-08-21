import { Check } from 'lucide-react'

export function WhyChoose() {
  const items = [
    {
      title: 'Intentional design',
      desc: 'Quiet architecture and generous room planning that honours the mountain landscape.'
    },
    {
      title: 'Wellness-first service',
      desc: 'Curated spa rituals, guided movement and restorative culinary journeys.'
    },
    {
      title: 'Thoughtful hospitality',
      desc: 'Personalised guest experiences, discreet service and attention to detail.'
    }
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">A quiet, purposeful hospitality</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-text-muted">We focus on calm design, restorative services and curated experiences that return clarity and rest.</p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {items.map((it) => (
            <div key={it.title} className="border-t border-border pt-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-full bg-secondary p-2.5 text-primary">
                  <Check size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-tight text-text">{it.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{it.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

