import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | RingShop",
  description: "RingShop's privacy policy explains how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 16, 2025</p>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <p className="text-sm">
            Тази Политика за поверителност описва как RingShop събира, използва и споделя вашите лични
            информация, когато посещавате нашия уебсайт, правите покупка или взаимодействате с нас по някакъв начин. Ние уважаваме вашите
            поверителността и се ангажираме да защитаваме вашата лична информация.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Информация, която събираме</h2>
          <p>Ние събираме няколко вида информация от и за потребителите на нашия уебсайт, включително:</p>
          <ul>
            <li>
              <strong>Лична информация:</strong> Име, имейл адрес, пощенски адрес, телефонен номер, плащане
              информация и всяка друга информация, която ни предоставяте.
            </li>
            <li>
              <strong>Информация за употреба:</strong> Информация за това как използвате нашия уебсайт, продукти и услуги.
            </li>
            <li>
              <strong>Информация за устройството:</strong> Информация за устройството, което използвате за достъп до нашия уебсайт, включително
              IP адрес, тип браузър и операционна система.
            </li>
            <li>
              <strong>Бисквитки и подобни технологии:</strong> Използваме бисквитки и подобни технологии за събиране
              информация за вашите дейности при сърфиране.
            </li>
          </ul>

          <h2>Как използваме вашата информация</h2>
          <p>Ние използваме информацията, която събираме, за да:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders, products, and services</li>
            <li>Provide customer support</li>
            <li>Improve our website, products, and services</li>
            <li>Personalize your shopping experience</li>
            <li>Send you marketing communications (if you've opted in)</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>How We Share Your Information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>
              <strong>Service Providers:</strong> Companies that perform services on our behalf, such as payment
              processing, shipping, and marketing.
            </li>
            <li>
              <strong>Business Partners:</strong> Trusted third parties who help us operate our business.
            </li>
            <li>
              <strong>Legal Authorities:</strong> When required by law or to protect our rights.
            </li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul>
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to delete your personal information</li>
            <li>The right to restrict or object to processing</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p>To exercise these rights, please contact us using the information provided below.</p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access,
            alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic
            storage is 100% secure, so we cannot guarantee absolute security.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this
            Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our website is not intended for children under 13 years of age. We do not knowingly collect personal
            information from children under 13.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last Updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>
            Email: privacy@RingShop.com
            <br />
            Address: Ул. Тракия 43, Пловдив 4000
            <br />
            Phone: +359 878 027087
          </p>
        </div>
      </div>
    </div>
  )
}
