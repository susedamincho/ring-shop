import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About Us | RingShop",
  description: "Learn about RingShop, our mission, values, and the team behind our brand.",
}

export default function AboutPage() {
  return (
    <div className="container max-w-5xl py-12 px-4 md:px-6">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About RingShop</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Redefining urban fashion since 2015. We bring you the latest trends with quality and sustainability in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              RingShop was born from a passion for urban fashion and a desire to make high-quality streetwear
              accessible to everyone. What started as a small boutique in downtown has grown into a global brand with a
              dedicated community.
            </p>
            <p className="text-muted-foreground">
              Our journey began when our founders, avid streetwear enthusiasts, noticed a gap in the market for
              affordable yet high-quality urban fashion. They set out to create a brand that would not only offer the
              latest trends but also prioritize sustainability and ethical manufacturing.
            </p>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=800&width=600"
              alt="RingShop store"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="bg-muted rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Quality</h3>
              <p className="text-muted-foreground">
                We never compromise on quality. Each product is carefully crafted using premium materials to ensure
                durability and comfort.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
              <p className="text-muted-foreground">
                We're committed to reducing our environmental footprint through sustainable sourcing, eco-friendly
                packaging, and ethical manufacturing processes.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-muted-foreground">
                We believe in building a community of like-minded individuals who share our passion for streetwear and
                urban culture.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Alex Johnson", role: "Founder & CEO", image: "/placeholder.svg?height=300&width=300" },
              { name: "Jamie Smith", role: "Creative Director", image: "/placeholder.svg?height=300&width=300" },
              { name: "Taylor Wong", role: "Head of Design", image: "/placeholder.svg?height=300&width=300" },
              { name: "Morgan Lee", role: "Customer Experience", image: "/placeholder.svg?height=300&width=300" },
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
