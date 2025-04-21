import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | RingShop",
  description: "RingShop's terms of service and conditions of use.",
}

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: April 16, 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            Welcome to RingShop. These Terms of Service ("Terms") govern your use of our website, products, and
            services. By accessing or using RingShop, you agree to be bound by these Terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our website, you agree to be bound by these Terms and our Privacy Policy. If you do
            not agree to these Terms, please do not use our services.
          </p>

          <h2>2. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of any material changes by
            updating the "Last Updated" date at the top of this page. Your continued use of our services after such
            modifications will constitute your acknowledgment of the modified Terms.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. You are
            responsible for safeguarding your password and for all activities that occur under your account. Notify us
            immediately of any unauthorized use of your account.
          </p>

          <h2>4. Products and Orders</h2>
          <p>
            All product descriptions, including pricing and availability, are subject to change without notice. We
            reserve the right to limit quantities, reject, or cancel orders at our discretion.
          </p>

          <h2>5. Payment Terms</h2>
          <p>
            By providing a payment method, you represent that you are authorized to use the designated payment method.
            You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping
            fees.
          </p>

          <h2>6. Shipping and Delivery</h2>
          <p>
            Shipping times are estimates and not guaranteed. We are not responsible for delays caused by carriers,
            customs, or other factors outside our control. Please refer to our Shipping Policy for more details.
          </p>

          <h2>7. Returns and Refunds</h2>
          <p>
            Please refer to our Return Policy for information about returns, exchanges, and refunds. Certain items may
            be ineligible for return or exchange.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            All content on our website, including text, graphics, logos, images, and software, is the property of
            RingShop and is protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h2>9. User Content</h2>
          <p>
            By submitting content to our website (such as reviews or comments), you grant us a non-exclusive,
            royalty-free, perpetual, irrevocable right to use, reproduce, modify, adapt, publish, translate, create
            derivative works from, distribute, and display such content worldwide.
          </p>

          <h2>10. Prohibited Activities</h2>
          <p>
            You agree not to engage in any activity that interferes with or disrupts our services, attempts to access
            data not intended for you, or otherwise violates any laws or regulations.
          </p>

          <h2>11. Disclaimer of Warranties</h2>
          <p>
            Our services are provided "as is" without any warranties, expressed or implied. We do not guarantee that our
            services will be error-free or uninterrupted.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            In no event shall RingShop be liable for any indirect, incidental, special, consequential, or punitive
            damages arising out of or related to your use of our services.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the state of New York, without
            regard to its conflict of law provisions.
          </p>

          <h2>14. Contact Information</h2>
          <p>For questions about these Terms, please contact us at legal@RingShop.com.</p>
        </div>
      </div>
    </div>
  )
}
