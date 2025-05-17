"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function MobileNav({ navItems, categories }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-2 py-4">
        <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
          <span className="text-xl font-bold">RingShop</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="flex flex-col gap-3 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block py-2 text-lg ${pathname === item.href ? "font-semibold" : "text-muted-foreground"}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}

          <li>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories" className="border-none">
                <AccordionTrigger className="py-2 text-lg">Категории</AccordionTrigger>
                <AccordionContent>
                  <ul className="ml-4 space-y-2">
                    {categories.length === 0 ? (
                      <li className="text-muted-foreground">Няма налични категории</li>
                    ) : (
                      categories.map((category) => (
                        <li key={category.id}>
                          <Link
                            href={`/category/${category.slug}`}
                            className="block py-1 text-muted-foreground"
                            onClick={() => setOpen(false)}
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))
                    )}
                    <li>
                      <Link
                        href="/products"
                        className="block py-1 font-medium text-primary"
                        onClick={() => setOpen(false)}
                      >
                        Виж всички продукти
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>

          <li>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="policies" className="border-none">
                <AccordionTrigger className="py-2 text-lg">Политики</AccordionTrigger>
                <AccordionContent>
                  <ul className="ml-4 space-y-2">
                    <li>
                      <Link
                        href="/terms-of-service"
                        className="block py-1 text-muted-foreground"
                        onClick={() => setOpen(false)}
                      >
                        Общи условия
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="block py-1 text-muted-foreground"
                        onClick={() => setOpen(false)}
                      >
                        Политика за поверителност
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shipping-policy"
                        className="block py-1 text-muted-foreground"
                        onClick={() => setOpen(false)}
                      >
                        Политика за доставка
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        </ul>
      </nav>
      <div className="border-t px-2 py-4">
        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full justify-start" onClick={() => setOpen(false)}>
            <Link href="/login">Вход</Link>
          </Button>
          <Button asChild className="w-full justify-start" onClick={() => setOpen(false)}>
            <Link href="/register">Създай профил</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
