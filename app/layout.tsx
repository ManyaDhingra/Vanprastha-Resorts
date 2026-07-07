import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Poppins } from 'next/font/google'
import "../styles/globals.css";
import { SiteHeader } from '@/components/layout/site-header'
import { Footer } from '@/components/layout/footer'
import { AuthProvider } from '@/components/auth/auth-provider'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700']
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Vanprastha Resorts | Luxury mountain resort in Uttarakhand',
  description:
    'A premium mountain resort retreat offering calm hospitality, wellness programs and mountain-view villas in Uttarakhand.',
  metadataBase: new URL('https://vanprastha-resorts.vercel.app'),
  openGraph: {
    title: 'Vanprastha Resorts',
    description:
      'A premium mountain resort retreat offering calm hospitality, wellness programs and mountain-view villas in Uttarakhand.',
    type: 'website',
    siteName: 'Vanprastha Resorts'
  },
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background text-text antialiased">
        <AuthProvider>
          <div className="relative overflow-hidden">
            <SiteHeader />
            {children}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
