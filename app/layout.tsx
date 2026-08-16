import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AIAssistantLauncher } from "@/features/ai/components/ai-assistant-launcher"
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Sri Lakshmivilas Purathana Lala Sweets | Tirunelveli Ghee Halwa Since 1882",
  description:
    "Sri Lakshmivilas Purathana Lala Sweets in Vannarpettai, Tirunelveli, known for authentic Tirunelveli ghee halwa and traditional sweets since 1882.",
  openGraph: {
    title: "Sri Lakshmivilas Purathana Lala Sweets",
    description: "Authentic Tirunelveli Ghee Halwa & Traditional Sweets since 1882.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased")}
    >
      <body className="bg-background text-foreground">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Sri Lakshmivilas Purathana Lala Sweets",
              description: "Authentic Tirunelveli Ghee Halwa & Traditional Sweets since 1882.",
              telephone: "+918220266077",
              email: "srilakshmivilassweets.tvl@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "101/1, North Bypass Road, Vannarpettai",
                addressLocality: "Tirunelveli",
                addressRegion: "Tamil Nadu",
                postalCode: "627003",
                addressCountry: "IN",
              },
            }),
          }}
        />
        <ThemeProvider>
          {children}
          <AIAssistantLauncher />
        </ThemeProvider>
      </body>
    </html>
  )
}
