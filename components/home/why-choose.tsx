import Link from 'next/link'
import Image from 'next/image'

export function WhyChoose() {
  return (
    <section id="about" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              About the resort
            </p>
            <h2 className="mt-3 font-heading text-3xl font-normal leading-[1.15] text-text">
              What Is Vanprastha?
            </h2>

            <div className="mt-6 space-y-4 text-[15px] leading-7 text-text-muted">
              <p>
                Vanaprastha literally means &ldquo;giving up worldly
                life&rdquo;&nbsp;&mdash; a composite of the roots
                &lsquo;vana&rsquo; (forest, distant land) and
                &lsquo;prastha&rsquo; (journey to, abiding in). It represents
                the third of four Vedic ashramas: the stage of gradual
                withdrawal from worldly responsibilities toward spiritual
                reflection.
              </p>
              <p>
                Nestled in the Dunagiri foothills of Uttarakhand, just
                1.5&nbsp;km from the holy cave where Mahavatar Babaji
                initiated Lahiri Mahasaya in 1861&nbsp;&mdash; the birthplace
                of Kriya Yoga&nbsp;&mdash; Vanprastha Resorts is a 3,025&nbsp;sq
                mtr eco-yoga retreat built entirely of pine&nbsp;wood.
              </p>
            </div>

            {/* Four ashrama stages — compact row */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { stage: 'Brahmacharya', role: 'Student' },
                { stage: 'Grihastha', role: 'Householder' },
                { stage: 'Vanaprastha', role: 'Withdrawal' },
                { stage: 'Sannyasa', role: 'Renunciation' },
              ].map((s) => (
                <div
                  key={s.stage}
                  className="rounded-xl border border-border/60 bg-surface px-3 py-3 text-center shadow-card"
                >
                  <p className="text-xs font-semibold leading-tight text-text">
                    {s.stage}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {s.role}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary/90"
              >
                Discover Vanprastha
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-72 w-full overflow-hidden rounded-2xl shadow-card sm:h-96 lg:h-[480px]">
            <Image
              src="/images/about/placeholder.svg"
              alt="Vanprastha Resorts in the Dunagiri foothills"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
