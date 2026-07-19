import Link from "next/link"

export default function AccountCustomCakeRequestsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-heading text-3xl font-medium">Custom Cake Requests</h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        Customers will be able to review original inputs, AI-generated summaries, bakery revisions, quote status, and payments here after Supabase persistence is connected.
      </p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="font-medium">No saved requests in this local preview.</p>
        <p className="mt-2 text-sm text-muted-foreground">Drafts and confirmed summaries will be private to the signed-in customer.</p>
        <Link href="/custom-cake" className="mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline">
          Create a custom cake request
        </Link>
      </div>
    </main>
  )
}
