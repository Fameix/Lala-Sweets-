import { SimplePage } from "@/components/layout/simple-page"

export default function CustomCakePage() {
  return (
    <SimplePage
      title="Custom Cake Request"
      description="The custom cake workflow will collect occasion, date, servings, flavour, egg preference, budget, reference images, branch, and contact details for admin quotation."
      actionHref="/contact"
      actionLabel="Contact bakery"
    />
  )
}
