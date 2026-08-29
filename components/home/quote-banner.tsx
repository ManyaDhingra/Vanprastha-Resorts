import Image from 'next/image'

export function QuoteBanner() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto w-full max-w-[1400px] overflow-hidden shadow-xl">
        <Image
          src="/images/quote-banner.webp"
          alt="Quote banner"
          width={1774}
          height={887}
          className="h-[220px] w-full object-cover object-center sm:h-[300px] lg:h-[400px]"
          priority
        />
      </div>
    </section>
  )
}
