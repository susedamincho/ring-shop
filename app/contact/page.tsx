import ContactPageClient from "./ContactPageClient"

// This would normally be in the layout.tsx file, but since we're using client components
// we'll handle metadata differently
export const metadata = {
  title: "Contact Us | RingShop",
  description: "Get in touch with the RingShop team. We're here to help with any questions or feedback.",
}

export default function ContactPage() {
  return <ContactPageClient />
}
