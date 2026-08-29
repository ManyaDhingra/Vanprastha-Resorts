import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'About Us — Vanprastha Resorts',
  description:
    'Learn about Vanprastha Resorts, an eco-yoga retreat in the Dunagiri foothills of Uttarakhand, at the lotus feet of Mahavtar Babaji\'s Cave.',
}

/* ─── data ───────────────────────────────────────────────────────── */

const ashramStages = [
  {
    stage: 'Brahmacharya',
    role: 'Bachelor / Student',
    desc: 'The first stage of life: a period of learning, discipline and preparation.',
  },
  {
    stage: 'Grihastha',
    role: 'Householder',
    desc: 'The second stage: building a family, pursuing livelihood and social duties.',
  },
  {
    stage: 'Vanaprastha',
    role: 'Withdrawal / Transition',
    desc: 'The third stage: gradually stepping back from worldly responsibilities toward inner reflection.',
  },
  {
    stage: 'Sannyasa',
    role: 'Renunciation / Spiritual Pursuit',
    desc: 'The fourth stage: full renunciation and devoted pursuit of spiritual liberation.',
  },
]

const destinations = [
  {
    id: 'babaji',
    title: 'Mahavtar Babaji\u2019s Cave',
    subtitle: 'Holy Cave of Sri Sri Mahavataar Babaji',
    distance: '1.5 km from the resort',
    content:
      'This cave is one of the most spiritual caves in the Himalayan region. It is the origin of Kriya Yoga where Yoga Guru Sri Lahiri Mahasay received Kriya Yoga teachings directly from Sri Sri Mahavataar Babaji.\n\nEveryday many pilgrims and Kriya Yogis that follow different gurus visit the cave.\n\nTo understand the historical significance of the cave, it is suggested that devotees read Chapter 34 \u201cMaterialising a Palace in the Himalayas\u201d from the Autobiography of a Yogi, and \u201cA Blessing from Mahavataar Babaji\u201d from Only Love by Sri Sri Daya Mata.\n\nThe cave area is the place where Babaji initiated Lahiri Mahasaya in 1861 and is the birth of Kriya Yoga in this Dwapara Yuga.\n\nHoly Cave of Mahavatar Babaji is situated just 1.5 km away from the resort. Guide, trek route and other assistance is provided by the resort.',
    image: '/images/about/babaji_cave.webp',
  },
  {
    id: 'pandukholi',
    title: 'Pandukholi',
    subtitle: '',
    distance: '3 km from the resort',
    content:
      'This cave is believed to have been one of the shelters of the Pandavas, the sons of Pandu during the 1-year \u2018Agyatvas\u2019 after their 14-year exile as mentioned in the Mahabharata.\n\nThe name Pandukholi is also derived from the legend, \u2018Pandu\u2019 meaning the sons of Pandu that is Pandav and \u2018kholi\u2019 meaning shelter.\n\nPandukholi is about 3 Km away from the resort.',
    image: '/images/about/Pandukholi-2.webp',
  },
  {
    id: 'dunagiri',
    title: 'Dunagiri Temple',
    subtitle: '',
    distance: '6 km from the resort',
    content:
      'Dunagiri Temple is a famous temple of the Hindus, situated at a distance of 6 km from the resort.\n\nThis temple is situated on the top of Drona Mountain. Dunagiri is also known as Dronagiri. The mountain is associated with Dronacharya, a Guru (Teacher) of the Pandavas.\n\nThe temple is one of the oldest and Siddha Shaktipeeth temples in Uttarakhand. Maa Dunagiri Temple is considered the second Vaishno Shaktipeeth in the Kumaon region after Vaishno Devi.\n\nThe temple is situated at an altitude of approximately 8,000 feet above sea level. The road leads to the temple by approximately 365 stairs. The stairs are covered, and thousands of bells are hanging along the way.\n\nThe maintenance work of the Dunagiri Temple is done by the \u2018Aadi Shakti Maa Dunagiri Mandir Trust\u2019. Daily bhandara are organised by the Trust in the Dunagiri Temple.\n\nThe full range of Himalayan mountains can be seen from the Dunagiri Temple.',
    image: '/images/about/Dunagiri-Temple-1-1-1.webp',
  },
  {
    id: 'kausani',
    title: 'Kausani',
    subtitle: '',
    distance: 'Approximately 90 minutes from the resort',
    content:
      'Kausani is a hill station and village situated in Bageshwar district in the state of Uttarakhand, India.\n\nIt is approximately 90 minutes away from the resort. It is famous for its scenic splendour and its spectacular panoramic view of Himalayan peaks like Trisul, Nanda Devi and Panchachuli.\n\nMahatma Gandhi called this place the \u201cSwitzerland of India\u201d, due to the similarity in landscapes.',
    image: '/images/about/kausani.webp',
  },
  {
    id: 'kainchi',
    title: 'Kainchi Dham',
    subtitle: '',
    distance: '',
    content:
      'Kainchi Dham is so much more than just being a temple or place of the saint.\n\nIt is the dham associated with Neem Karoli Maharaj.\n\nThe destination is located on the way to Dunagiri from Pant Nagar airport or Kathgodam railway station.',
    image: '/images/about/kausani.webp',
  },
]

/* ─── page ───────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <main>
      {/* ── hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/about/about.png"
            alt=""
            fill
            className="object-cover opacity-30"
          />
        </div>
        <Container className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="kicker">About the resort</p>
            <h1 className="mt-4 font-heading text-4xl font-normal leading-[1.15] text-white sm:text-5xl">
              What Is Vanprastha?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80">
              A calm mountain refuge in the Dunagiri foothills of Uttarakhand,
              at the lotus feet of Mahavtar Babaji&apos;s Cave.
            </p>
          </div>
        </Container>
      </section>

      {/* ── "A Typical Vanprastha" intro ─────────────────────────── */}
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">
              A Typical Vanprastha
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-7 text-text-muted">
              <p>
                Vanaprastha Resort &mdash; Vanaprastha literally means
                &ldquo;giving up worldly life&rdquo;.
              </p>
              <p>
                Vanaprastha is a composite word with the roots &lsquo;vana&rsquo;
                meaning &ldquo;forest, distant land&rdquo;, and
                &lsquo;prastha&rsquo; meaning &ldquo;going to, abiding in,
                journey to&rdquo;. The composite word literally means
                &ldquo;retiring to forest&rdquo;.
              </p>
              <p>
                It is also a concept in Hindu traditions, representing the third
                of four ashramas (stages of human life); the other three being:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li>
                  Brahmacharya &ndash; bachelor student &ndash; 1st stage
                </li>
                <li>
                  Grihastha &ndash; married householder &ndash; 2nd stage
                </li>
                <li>
                  Vanaprastha &ndash; gradual withdrawal from worldly
                  responsibilities &ndash; 3rd stage
                </li>
                <li>
                  Sannyasa &ndash; renunciation / ascetic life &ndash; 4th stage
                </li>
              </ul>
              <p>
                Vanaprastha is a part of the Vedic Ashram System, which starts
                when a person hands over household responsibilities to the next
                generation, takes an advisory role, and gradually withdraws from
                the world.
              </p>
              <p>
                This stage typically follows Grihastha (householder), but a man or
                a woman may choose to skip the householder stage and enter
                Vanaprastha directly after Brahmacharya (student) stage, as a
                prelude to Sannyasa (ascetic) and spiritual pursuits.
              </p>
              <p>
                Vanaprastha stage is considered a transition phase from a
                householder&apos;s life with greater emphasis on Artha and Kama
                (wealth, security, pleasure and sexual pursuits) to one with
                greater emphasis on Moksha (spiritual liberation).
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Vedic Ashram System ──────────────────────────────────── */}
      <section className="bg-secondary py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">
              The Vedic Ashram System
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              Four stages of human life in the Vedic tradition
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ashramStages.map((s) => (
              <div
                key={s.stage}
                className="rounded-2xl border border-border/60 bg-surface p-6 text-center shadow-card"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-lg font-semibold text-primary">
                    {ashramStages.indexOf(s) + 1}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-text">
                  {s.stage}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-accent">
                  {s.role}
                </p>
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Experience Vanprastha ────────────────────────────────── */}
      <section className="py-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="kicker">The experience</p>
              <h2 className="mt-3 font-heading text-3xl font-normal leading-[1.15] text-text">
                Experience Vanprastha
              </h2>
              <div className="mt-6 space-y-4 text-[15px] leading-7 text-text-muted">
                <p>
                  Experience the Blissful &amp; Blessed stay at Vanprastha
                  Resorts, Dunagiri Mountains, Uttarakhand, which is situated at
                  the lotus feet of Mahavtar Babaji&apos;s Cave and is placed
                  right in the foothills of the Himalayas.
                </p>
                <p>
                  Just 1.5 kilometres away from the place where Babaji initiated
                  Lahiri Mahasaya in the year 1861 and which is known as the
                  birthplace of &ldquo;Kriya Yoga&rdquo;, in an introverted
                  gentle village called Ratkhal.
                </p>
                <p>
                  This nest of utter, gentle calm is where life takes a restful
                  pause to meditate on things far more profound than the worldly.
                </p>
              </div>
            </div>
            <div className="relative h-72 w-full overflow-hidden rounded-xl sm:h-96 lg:h-[480px]">
              <Image
                src="/images/experience-1.jpg"
                alt="Experience Vanprastha"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ── The Resort ───────────────────────────────────────────── */}
      <section className="bg-secondary py-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative h-72 w-full order-2 overflow-hidden rounded-xl sm:h-96 lg:h-[480px] lg:order-2">
              <Image
                src="/images/about/1.jpg"
                alt="The Resort"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-1">
              <p className="kicker">The resort</p>
              <h2 className="mt-3 font-heading text-3xl font-normal leading-[1.15] text-text">
                The Resort
              </h2>
              <div className="mt-6 space-y-4 text-[15px] leading-7 text-text-muted">
                <p>
                  Upon reaching your destination, as your vehicle gently rolls
                  down the hillside, the resort in hiding till then, comes into
                  view.
                </p>
                <p>
                  You notice its terraced topography as it meanders 100 feet,
                  right down to the Babaji&apos;s Cave, while all around, the
                  mighty Dunagiri Himalayan mountains play watchful guardian.
                </p>
                <p>
                  This 3025 sq mtr luxury resort in Dunagiri Hills with its
                  eco-friendly habitat, is designed not to intrude on its
                  surroundings.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-text">
                    Vedic Block
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    4 luxury cottages &mdash; named after the four Vedas: Rig
                    Veda, Yajur Veda, Sama Veda, Atharva Veda.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">
                    Ashtanga Yoga Block
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    8 deluxe suites &mdash; Yama, Niyama, Asana, Pranayama,
                    Pratyahara, Dharana, Dhyana, Samadhi.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">
                    Triveni Block
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    3 premium rooms &mdash; Ganga, Yamuna, Saraswati.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">
                    Cottage with Attic
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    2 private cottages &mdash; Kedarnath, Badrinath.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3 text-[15px] leading-7 text-text-muted">
                <p>
                  The whole resort, including living rooms, meditation hall and
                  dining hall, is made of pine wood to give the feeling of living
                  in the woods.
                </p>
                <p>
                  Vanprastha Resorts is an Eco-Yoga Resort. Consumption of
                  alcoholic drinks (Liquor), Tobacco &amp; Smoking is strictly
                  prohibited inside the property. Food served at the resort is
                  strictly vegetarian. The tariff per night includes all meals
                  for the guests.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Nearby Places to Visit ───────────────────────────────── */}
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">
              Nearby Places to Visit
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              Sacred sites and natural wonders within reach of the resort
            </p>
          </div>

          <div className="mt-12 space-y-16">
            {destinations.map((d, i) => (
              <article
                key={d.id}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <div
                  className={i % 2 === 0 ? 'order-2 lg:order-1' : 'order-2'}
                >
                  {d.distance && (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
                      {d.distance}
                    </p>
                  )}
                  <h3 className="font-heading text-2xl font-normal text-text">
                    {d.title}
                  </h3>
                  {d.subtitle && (
                    <p className="mt-1 text-sm italic text-text-muted">
                      {d.subtitle}
                    </p>
                  )}
                  <div className="mt-4 space-y-3 text-sm leading-7 text-text-muted">
                    {d.content.split('\n\n').map((para, pi) => (
                      <p key={pi}>{para}</p>
                    ))}
                  </div>
                </div>
                <div
                  className={`relative h-64 w-full overflow-hidden rounded-xl sm:h-80 lg:h-96 ${
                    i % 2 === 0 ? 'order-1 lg:order-2' : 'order-1'
                  }`}
                >
                  <Image
                    src={d.image}
                    alt={d.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-primary py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-normal leading-[1.15] text-white">
              Begin Your Journey
            </h2>
            <p className="mt-4 text-base leading-7 text-white/80">
              Step away from the noise. Find stillness in the mountains.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/rooms"
                className="inline-flex h-12 items-center rounded-full bg-accent px-8 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent/90"
              >
                Explore Rooms
              </Link>
              <Link
                href="/book"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-8 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Book a Stay
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}
