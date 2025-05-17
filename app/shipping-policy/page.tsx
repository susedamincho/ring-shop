// файл: ShippingPolicyPage.tsx

import type { Metadata } from "next"
import { Truck, Package, Clock, RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "Политика за доставка | RingShop",
  description: "Информация относно методите за доставка, сроковете и процедурите за връщане в RingShop.",
}

export default function ShippingPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6">
      <div className="space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Политика за доставка</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Всичко, което трябва да знаете за нашите методи за доставка, срокове за доставка и процедури за връщане.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Truck className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Безплатна доставка</h2>
            <p className="text-muted-foreground">
              Безплатна стандартна доставка за всички поръчки над 75 лева в рамките на България.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Package className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Международна доставка</h2>
            <p className="text-muted-foreground">
              Изпращаме до над 50 държави по света с конкурентни цени, изчислени при плащане.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Clock className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Време за обработка</h2>
            <p className="text-muted-foreground">
              Поръчките се обработват в рамките на 1-2 работни дни преди изпращане.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <RefreshCw className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Лесно връщане</h2>
            <p className="text-muted-foreground">
              Безпроблемно връщане в рамките на 30 дни след доставка.
            </p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Методи и срокове за доставка</h2>

          <h3>Доставка в България</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left">Метод на доставка</th>
                <th className="border p-2 text-left">Очакван срок</th>
                <th className="border p-2 text-left">Цена</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Стандартна доставка</td>
                <td className="border p-2">3–5 работни дни</td>
                <td className="border p-2">$5.99 (безплатна над $75)</td>
              </tr>
              <tr>
                <td className="border p-2">Експресна доставка</td>
                <td className="border p-2">2–3 работни дни</td>
                <td className="border p-2">$12.99</td>
              </tr>
              <tr>
                <td className="border p-2">Доставка на следващия ден</td>
                <td className="border p-2">1 работен ден</td>
                <td className="border p-2">$24.99</td>
              </tr>
            </tbody>
          </table>

          <h3>Международна доставка</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left">Регион</th>
                <th className="border p-2 text-left">Очакван срок</th>
                <th className="border p-2 text-left">Цена</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Канада</td>
                <td className="border p-2">5–10 работни дни</td>
                <td className="border p-2">От $14.99</td>
              </tr>
              <tr>
                <td className="border p-2">Европа</td>
                <td className="border p-2">7–14 работни дни</td>
                <td className="border p-2">От $19.99</td>
              </tr>
              <tr>
                <td className="border p-2">Азия и Тихоокеански регион</td>
                <td className="border p-2">10–20 работни дни</td>
                <td className="border p-2">От $24.99</td>
              </tr>
              <tr>
                <td className="border p-2">Останал свят</td>
                <td className="border p-2">14–30 работни дни</td>
                <td className="border p-2">От $29.99</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>Забележка:</strong> Международните клиенти може да бъдат обект на митнически такси, вносни мита и
            данъци, които са за тяхна сметка.
          </p>

          <h2>Проследяване на поръчки</h2>
          <p>След изпращане ще получите имейл с потвърждение и номер за проследяване. Можете да проследите поръчката си чрез:</p>
          <ul>
            <li>Връзката за проследяване в имейла</li>
            <li>Влизане в акаунта си и преглед на историята на поръчките</li>
            <li>Свързване с екипа ни за обслужване</li>
          </ul>

          <h2>Ограничения за доставка</h2>
          <p>Не доставяме до пощенски кутии, APO/FPO адреси и някои отдалечени райони. При въпроси – свържете се с нас.</p>

          <h2>Изгубени или повредени пратки</h2>
          <p>
            Ако пратката Ви бъде изгубена или повредена по време на транспорт, свържете се с нас в рамките на 7 дни от
            очакваната дата за доставка. Ще съдействаме за разрешаване на проблема.
          </p>

          <h2>Връщане на продукти</h2>
          <p>
            За подробности относно връщания, вижте нашата{" "}
            <a href="/returns" className="text-primary hover:underline">Политика за връщане</a>. В обобщение:
          </p>
          <ul>
            <li>Връщането трябва да бъде инициирано до 30 дни след доставка</li>
            <li>Клиентите поемат разходите за връщане, освен ако не е по наша вина</li>
            <li>Предлагаме предплатен етикет за връщане срещу такса $7.99 (удържана от сумата за възстановяване)</li>
            <li>Първоначалните разходи за доставка не се възстановяват</li>
          </ul>

          <h2>Свържете се с нас</h2>
          <p>Ако имате въпроси относно нашата политика за доставка:</p>
          <p>
            Имейл: shipping@RingShop.com
            <br />
            Телефон: +1 (555) 123-4567
            <br />
            Работно време: Понеделник–Петък, 9:00–17:00 EST
          </p>
        </div>
      </div>
    </div>
  )
}
