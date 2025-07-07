import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zenlit - Real-World Networking. Reinvented.',
  description: 'Connect with people around you without the noise. No followers, no likes, just genuine human connections.',
  keywords: 'networking, social media, local connections, proximity, real-world networking',
  openGraph: {
    title: 'Zenlit - Real-World Networking. Reinvented.',
    description: 'Connect with people around you without the noise. No followers, no likes, just genuine human connections.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zenlit - Real-World Networking. Reinvented.',
    description: 'Connect with people around you without the noise. No followers, no likes, just genuine human connections.',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}