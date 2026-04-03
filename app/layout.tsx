import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/sonner"
import QueryProvider from "@/app/QueryProvider"
import InstallPrompt from "@/components/InstallPrompt"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Covest",
  description: "Track real-time stock prices and get notified when your alerts trigger.",
  applicationName: "CoVest",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CoVest",
  },
  icons: {
    apple: "/assets/icons/web-app-manifest-192x192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#050505",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
        <QueryProvider>
          <InstallPrompt />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
