import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Política de reembolsos | Bioly",
};

export default function ReembolsosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Política de reembolsos</h1>
        <p className="text-sm text-[#999999] mb-10">Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-[#333333] dark:text-[#d4d4d8] leading-relaxed">
          <section className="p-5 rounded-2xl bg-[#f9fafb] dark:bg-[#0a0a0a] border border-[#eeeeee] dark:border-[#222]">
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">Todas las ventas son finales</h2>
            <p>
              Bioly no ofrece reembolsos. El acceso a lo que compras (funciones de plan pagado, o un enlace privado
              de un creador) se otorga de forma inmediata en el momento del pago, por lo que el servicio se
              considera entregado y consumido desde ese instante. Al completar un pago en Bioly, aceptas
              expresamente esta política y renuncias a cualquier derecho de desistimiento aplicable a contenido
              digital de entrega inmediata, en la medida permitida por la ley de tu país.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">Planes Bioly (Pro / Business)</h2>
            <p>
              Puedes cancelar tu suscripción en cualquier momento desde tu panel de control para que no se te
              cobre en el próximo ciclo. La cancelación no genera un reembolso del período ya pagado — mantienes
              acceso a las funciones del plan hasta el final de ese período.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">Enlaces privados (suscripciones a creadores)</h2>
            <p>
              Cuando te suscribes a un enlace privado de un creador (por ejemplo, acceso a un grupo de Telegram),
              el pago se procesa mensualmente y de forma recurrente hasta que canceles. Puedes cancelar en
              cualquier momento; no hay reembolso del período ya pagado, ya que el acceso se otorga de inmediato.
              Bioly actúa únicamente como intermediario de pago — no somos responsables del contenido, grupo o
              beneficio que el creador ofrezca a cambio de la suscripción.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">Excepción: cobros por error</h2>
            <p>
              La única excepción es un cobro claramente erróneo de nuestra parte (por ejemplo, un cobro duplicado o
              un fallo técnico comprobable). En ese caso, contáctanos dentro de los 7 días siguientes al cargo y lo
              evaluaremos.
            </p>
          </section>

          <p className="text-sm text-[#999999]">
            Consulta también nuestros <Link href="/terminos" className="underline">Términos de servicio</Link> y
            nuestra <Link href="/privacidad" className="underline">Política de privacidad</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
