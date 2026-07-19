export function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-heading text-3xl font-medium">{title}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
    </main>
  )
}
