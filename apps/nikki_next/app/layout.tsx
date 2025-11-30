import type { Metadata } from "next"
import "./globals.css"
import { AppProviders } from "./providers"

export const metadata: Metadata = {
  title: "Nikki",
  description: "Journaling login portal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
