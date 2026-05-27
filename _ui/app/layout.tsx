import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'PeakAgent Interview — Listing Search',
  description: 'Coding test',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
          color: '#1a1a1a',
          background: '#f7f7f8',
        }}
      >
        {children}
      </body>
    </html>
  )
}
