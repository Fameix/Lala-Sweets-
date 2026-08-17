"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      gap={12}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "w-full",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
