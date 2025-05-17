import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "За нас | RingShop",
  description: "Научете повече за RingShop, нашата мисия, ценности и екипа зад марката.",
}

export default function AboutPage() {
  return (
    <div className="container max-w-5xl py-12 px-4 md:px-6">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">За RingShop</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Продаваме и препродаваме телефони с гаранция за качество, достъпна цена и безкомпромисно обслужване.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Нашата история</h2>
            <p className="text-muted-foreground mb-4">
              RingShop започна като малък магазин за употребявани телефони с една основна цел — да направим
              висококачествените смартфони достъпни за всеки.
            </p>
            <p className="text-muted-foreground">
              С времето разширихме дейността си, като предлагаме внимателно проверени, тествани и подготвени за повторна
              употреба телефони от водещи марки като Apple, Samsung, Xiaomi и други. Нашият ангажимент към
              прозрачността и клиентската удовлетвореност ни отличава на пазара.
            </p>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=800&width=600"
              alt="Магазинът на RingShop"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="bg-muted rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Нашите ценности</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Надеждност</h3>
              <p className="text-muted-foreground">
                Всеки телефон преминава през щателна проверка, за да гарантираме, че получавате устройството, което заслужавате.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Достъпност</h3>
              <p className="text-muted-foreground">
                Предлагаме конкурентни цени и различни модели, така че всеки клиент да открие подходящото устройство за себе си.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Обслужване</h3>
              <p className="text-muted-foreground">
                Екипът ни е винаги на разположение да отговори на вашите въпроси и да ви помогне да направите информиран избор.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Запознайте се с нашия екип</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Александър Петров", role: "Основател и управител", image: "/placeholder.svg?height=300&width=300" },
              { name: "Иван Георгиев", role: "Технически специалист", image: "/placeholder.svg?height=300&width=300" },
              { name: "Мария Димитрова", role: "Обслужване на клиенти", image: "/placeholder.svg?height=300&width=300" },
              { name: "Николай Тодоров", role: "Маркетинг и продажби", image: "/placeholder.svg?height=300&width=300" },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative h-48 w-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
