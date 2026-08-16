import Link from "next/link"
import { Bot, CakeSlice, Mic, ClipboardList } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const features = [
  { title: "Cake Size Calculator", icon: CakeSlice, text: "Use configured serving rules for guest-count estimates." },
  { title: "AI Ordering Assistant", icon: Bot, text: "Search real catalogue items and confirm cart changes." },
  { title: "Custom Cake Summary", icon: ClipboardList, text: "Turn request details into a bakery review brief." },
  { title: "Tamil and English Voice Ordering", icon: Mic, text: "Review transcripts before sending any request." },
]

export function AIHomeSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <h2 className="font-heading text-2xl font-medium">Meet Your AI Celebration Assistant</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Tell us your guest count, budget and occasion. We will help calculate the right cake size, find products and prepare a clear custom cake request.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          உங்கள் விருந்தினர் எண்ணிக்கை, பட்ஜெட் மற்றும் நிகழ்ச்சியை கூறுங்கள். சரியான கேக் அளவை கணக்கிட்டு, பொருத்தமான பொருட்களை கண்டுபிடித்து, Custom Cake தேவைகளை தெளிவாக தயாரிக்க உதவுகிறோம்.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/cake-serving-calculator" className={cn(buttonVariants())}>Calculate Cake Size</Link>
        <Link href="/ai-assistant" className={cn(buttonVariants({ variant: "outline" }))}>Ask Lala AI</Link>
        <Link href="/custom-cake" className={cn(buttonVariants({ variant: "outline" }))}>Create Custom Cake Request</Link>
      </div>
    </section>
  )
}

