import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return {
    title: 'Easy Loyalty SCAN',
    manifest: `/api/business/${slug}/manifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Easy Loyalty SCAN',
    },
    other: {
      'mobile-web-app-capable': 'yes',
    },
    icons: {
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  }
}

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
