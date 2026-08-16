import Link from "next/link"

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"

import { StorefrontShell } from "@/components/layout/storefront-shell"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const phone = "+91 82202 66077"
const email = "srilakshmivilassweets.tvl@gmail.com"
const mapsHref = "https://www.google.com/maps/search/?api=1&query=101%2F1%20North%20Bypass%20Road%20Vannarpettai%20Tirunelveli%20Tamil%20Nadu%20627003%20India"
const whatsappHref = "https://wa.me/918220266077?text=Vanakkam%2C%20I%20would%20like%20to%20enquire%20about%20Lala%20Sweets."

export default function ContactPage() {
  return (
    <StorefrontShell>
      <main className={cn(SITE_CONTENT_CLASS, "py-14")}>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Contact</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold">Visit Sri Lakshmivilas Purathana Lala Sweets</h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            For Tirunelveli ghee halwa, traditional sweets and savouries, contact the shop directly for current availability and enquiries.
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <Card>
            <CardContent className="grid gap-5 pt-6">
              <div>
                <h2 className="font-heading text-2xl font-medium">Sri Lakshimivilas Purathana Lala Sweets</h2>
                <p className="mt-2 text-sm font-medium text-primary">Since 1882</p>
              </div>
              <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                <p className="flex gap-3"><MapPin className="mt-1 size-4 shrink-0 text-primary" />101/1, North Bypass Road, Vannarpettai, Tirunelveli, Tamil Nadu 627003, India</p>
                <Link href="tel:+918220266077" className="flex gap-3 hover:text-foreground"><Phone className="mt-1 size-4 shrink-0 text-primary" />{phone}</Link>
                <Link href={`mailto:${email}`} className="flex gap-3 hover:text-foreground"><Mail className="mt-1 size-4 shrink-0 text-primary" />{email}</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="tel:+918220266077" className={cn(buttonVariants())}>
                  <Phone className="size-4" />
                  Call
                </Link>
                <Link href={whatsappHref} className={cn(buttonVariants({ variant: "outline" }))}>
                  <MessageCircle className="size-4" />
                  WhatsApp
                </Link>
                <Link href={`mailto:${email}`} className={cn(buttonVariants({ variant: "outline" }))}>
                  <Mail className="size-4" />
                  Email
                </Link>
                <Link href={mapsHref} className={cn(buttonVariants({ variant: "outline" }))}>
                  <MapPin className="size-4" />
                  Google Maps
                </Link>
              </div>
            </CardContent>
          </Card>
          <div className="min-h-[360px] overflow-hidden rounded-lg border border-border bg-card">
            <iframe
              title="Map to Sri Lakshmivilas Purathana Lala Sweets"
              src="https://www.google.com/maps?q=101%2F1%20North%20Bypass%20Road%20Vannarpettai%20Tirunelveli%20Tamil%20Nadu%20627003%20India&output=embed"
              className="h-full min-h-[360px] w-full"
              loading="lazy"
            />
          </div>
        </div>
      </main>
    </StorefrontShell>
  )
}
