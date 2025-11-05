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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.siteConfig.findFirst().catch(() => null)
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
