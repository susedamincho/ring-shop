import type { Metadata } from "next"
import { Truck, Package, Clock, RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "Shipping Policy | RingShop",
  description: "Information about RingShop's shipping methods, delivery times, and return procedures.",
}

export default function ShippingPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6">
      <div className="space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Shipping Policy</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
           Всичко, което трябва да знаете за нашите методи за доставка, срокове за доставка и процедури за връщане.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Truck className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Безплатна доставка</h2>
            <p className="text-muted-foreground">
             Безплатна стандартна доставка за всички поръчки над $75 в рамките на континенталните Съединени щати.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Package className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">International Shipping</h2>
            <p className="text-muted-foreground">
             Изпращаме до над 50 страни по света с конкурентни цени, изчислени при плащане.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Clock className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Време за обработка</h2>
            <p className="text-muted-foreground">Поръчките се обработват в рамките на 1-2 работни дни преди изпращане.</p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <RefreshCw className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Лесно връщане</h2>
            <p className="text-muted-foreground">Безпроблемно връщане в рамките на 30 дни след доставката.</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Методи на доставка и срокове за доставка</h2>

          <h3>Domestic Shipping (България)</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left">Метод на доставка</th>
                <th className="border p-2 text-left">Очаквано време за доставка</th>
                <th className="border p-2 text-left">цена</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Standard Shipping</td>
                <td className="border p-2">3-5 business days</td>
                <td className="border p-2">$5.99 (Free on orders over $75)</td>
              </tr>
              <tr>
                <td className="border p-2">Express Shipping</td>
                <td className="border p-2">2-3 business days</td>
                <td className="border p-2">$12.99</td>
              </tr>
              <tr>
                <td className="border p-2">Next Day Shipping</td>
                <td className="border p-2">1 business day</td>
                <td className="border p-2">$24.99</td>
              </tr>
            </tbody>
          </table>

          <h3>International Shipping</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left">Region</th>
                <th className="border p-2 text-left">Estimated Delivery Time</th>
                <th className="border p-2 text-left">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Canada</td>
                <td className="border p-2">5-10 business days</td>
                <td className="border p-2">Starting at $14.99</td>
              </tr>
              <tr>
                <td className="border p-2">Europe</td>
                <td className="border p-2">7-14 business days</td>
                <td className="border p-2">Starting at $19.99</td>
              </tr>
              <tr>
                <td className="border p-2">Asia & Pacific</td>
                <td className="border p-2">10-20 business days</td>
                <td className="border p-2">Starting at $24.99</td>
              </tr>
              <tr>
                <td className="border p-2">Rest of World</td>
                <td className="border p-2">14-30 business days</td>
                <td className="border p-2">Starting at $29.99</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>Note:</strong> International customers may be subject to customs fees, import duties, and taxes,
            which are the responsibility of the recipient.
          </p>

          <h2>Order Tracking</h2>
          <p>
            Once your order ships, you will receive a shipping confirmation email with a tracking number. You can track
            your order by:
          </p>
          <ul>
            <li>Clicking the tracking link in your shipping confirmation email</li>
            <li>Logging into your account and viewing your order history</li>
            <li>Contacting our customer service team</li>
          </ul>

          <h2>Shipping Restrictions</h2>
          <p>
            We currently do not ship to P.O. boxes, APO/FPO addresses, or certain remote locations. Please contact
            customer service if you have questions about shipping to your location.
          </p>

          <h2>Lost or Damaged Packages</h2>
          <p>
            If your package is lost or damaged during transit, please contact our customer service team within 7 days of
            the expected delivery date. We will work with the shipping carrier to resolve the issue and ensure you
            receive your order.
          </p>

          <h2>Return Shipping</h2>
          <p>
            For information about returning items, please see our{" "}
            <a href="/returns" className="text-primary hover:underline">
              Return Policy
            </a>
            . In general:
          </p>
          <ul>
            <li>Returns must be initiated within 30 days of delivery</li>
            <li>Customers are responsible for return shipping costs unless the return is due to our error</li>
            <li>We offer prepaid return labels for a flat fee of $7.99 (deducted from your refund)</li>
            <li>Original shipping costs are non-refundable</li>
          </ul>

          <h2>Contact Us</h2>
          <p>If you have any questions about our shipping policy, please contact our customer service team:</p>
          <p>
            Email: shipping@RingShop.com
            <br />
            Phone: +1 (555)
          </p>
          <p>
            Email: shipping@RingShop.com
            <br />
            Phone: +1 (555) 123-4567
            <br />
            Hours: Monday-Friday, 9am-5pm EST
          </p>
        </div>
      </div>
    </div>
  )
}
