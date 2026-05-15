import Link from "next/link";
import { Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/signup",
    priceMonthly: "$0",
    description: "Todo lo que necesitas para empezar tu identidad digital.",
    features: [
      "Links ilimitados",
      "5 Temas básicos",
      "Analíticas (últimos 7 días)",
      "Logo de Bioly visible",
      "Personalización básica",
    ],
    mostPopular: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "/dashboard", // Luego lo conectaremos a Stripe
    priceMonthly: "$8",
    description: "Para creadores que quieren estética y datos reales.",
    features: [
      "Links ilimitados",
      "Todos los temas",
      "Analíticas completas",
      "Quitar logo de Bioly",
      "Personalización avanzada",
      "Controles SEO incluidos",
      "Hasta 100 emails/mes",
      "Venta de productos (9% fee)",
    ],
    mostPopular: true,
  },
  {
    name: "Business",
    id: "tier-business",
    href: "/dashboard", // Luego lo conectaremos a Stripe
    priceMonthly: "$24",
    description: "Para marcas y negocios que necesitan control total.",
    features: [
      "Todo lo de Pro",
      "Colección de emails ilimitada",
      "Venta de productos (0% fee)",
      "Exportar Analíticas (CSV)",
      "Dominio propio (proximamente)",
      "Soporte prioritario",
    ],
    mostPopular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white dark:bg-[#050505]">
      <Navbar />
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-emerald-600">Precios Transparentes</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Elige el plan ideal para ti
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-300">
            Escala tu negocio con Bioly. Empieza gratis, actualiza cuando estés listo.
          </p>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {tiers.map((tier, tierIdx) => (
              <div
                key={tier.id}
                className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                  tier.mostPopular
                    ? "bg-[#111] dark:bg-white ring-[#111] dark:ring-white text-white dark:text-black scale-105 shadow-2xl"
                    : "ring-gray-200 dark:ring-[#222] bg-white dark:bg-[#0a0a0a]"
                }`}
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={`text-lg font-semibold leading-8 ${
                      tier.mostPopular ? "text-white dark:text-black" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  {tier.mostPopular ? (
                    <p className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-emerald-500">
                      Más popular
                    </p>
                  ) : null}
                </div>
                <p className={`mt-4 text-sm leading-6 ${tier.mostPopular ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-400"}`}>
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className={`text-4xl font-bold tracking-tight ${tier.mostPopular ? "text-white dark:text-black" : "text-gray-900 dark:text-white"}`}>
                    {tier.priceMonthly}
                  </span>
                  <span className={`text-sm font-semibold leading-6 ${tier.mostPopular ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-400"}`}>
                    /mes
                  </span>
                </p>
                <Link
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={`mt-6 block rounded-xl py-3 px-3 text-center text-sm font-bold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                    tier.mostPopular
                      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-emerald-500"
                      : "bg-[#111] dark:bg-white text-white dark:text-black hover:opacity-90 ring-1 ring-inset ring-[#111] dark:ring-white"
                  }`}
                >
                  Empezar ahora
                </Link>
                <ul
                  role="list"
                  className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${
                    tier.mostPopular ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className={`h-6 w-5 flex-none ${tier.mostPopular ? "text-emerald-500" : "text-emerald-600"}`}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
