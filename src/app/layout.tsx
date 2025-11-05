import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar'
import { SessionProvider } from '@/components/SessionProvider'
import { prisma } from '@/lib/prisma'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Lab Test Booking - Book Medical Tests Online",
  description: "Book medical tests online with ease. Fast, reliable, and convenient.",
};

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings with better error handling
  let settings = null
  try {
    settings = await prisma.siteConfig.findFirst()
  } catch (error) {
    console.error('Error fetching site config:', error)
    // Continue with defaults if database fails
  }
  
  const labName = settings?.labName || 'Lab Test Booking'
  const logoUrl = settings?.labLogoUrl || ''
  const primaryColor = settings?.primaryColor || '#059669'
  const secondaryColor = settings?.secondaryColor || '#10b981'

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} style={{ ['--primary-color' as any]: primaryColor, ['--secondary-color' as any]: secondaryColor }}>
        <SessionProvider>
          <Navbar labName={labName} logoUrl={logoUrl} />
          <main className="min-h-screen">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
