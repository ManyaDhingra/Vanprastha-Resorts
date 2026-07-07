import Image from 'next/image'

export function QuoteBanner() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-[1400px] overflow-hidden rounded-3xl shadow-xl">
        <Image
          src="/images/quote-banner.png"
          alt="Quote banner"
          width={1400}
          height={700}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  )
}
