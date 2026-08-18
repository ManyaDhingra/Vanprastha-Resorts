import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-200/75 bg-white/90 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <p>© 2026 Vanprastha Resorts. Crafted for premium mountain hospitality in Uttarakhand.</p>
          <Link href="/docs" className="text-primary underline-offset-4 hover:underline">
            System map
          </Link>
        </div>
        <p className="text-slate-500">Designed to reflect calmness, luxury and natural serenity across every stay.</p>
      </div>
    </footer>
  )
}