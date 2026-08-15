import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Términos de servicio | Bioly",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Términos de servicio</h1>
        <p className="text-sm text-[#999999] mb-10">Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-[#333333] dark:text-[#d4d4d8] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">1. Sobre Bioly</h2>
            <p>
              Bioly (<Link href="/" className="underline">bioly.space</Link>) es una plataforma que permite a creadores y negocios
              construir una página personal con enlaces a su contenido, redes sociales y productos. Al crear una
              cuenta o usar el servicio, aceptas estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">2. Cuentas</h2>
            <p>
              Eres responsable de la actividad que ocurre en tu cuenta y del contenido que publiques en tu página
              pública. Nos reservamos el derecho de suspender cuentas que infrinjan la ley, estos términos, o que
              se usen para distribuir contenido fraudulento, ilegal o dañino.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">3. Planes y pagos</h2>
            <p>
              Bioly ofrece un plan gratuito y planes de pago (Pro, Business) con funciones adicionales, facturados
              de forma recurrente. Los pagos se procesan a través de Lemon Squeezy, nuestro proveedor de pagos
              (Merchant of Record). Puedes cancelar tu suscripción en cualquier momento desde tu panel de control;
              la cancelación aplica al final del período ya pagado. Todas las ventas son finales: el acceso se
              otorga de inmediato al pagar, por lo que no se realizan reembolsos salvo lo indicado en nuestra{" "}
              <Link href="/reembolsos" className="underline">Política de reembolsos</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">4. Links privados / de pago</h2>
            <p>
              Los creadores pueden marcar un enlace como privado y cobrar una suscripción mensual a sus seguidores
              para acceder a él (por ejemplo, un grupo de Telegram). Bioly actúa únicamente como intermediario de
              pago y notificación — el creador es responsable de otorgar y mantener el acceso al contenido o grupo
              ofrecido, y de la veracidad de lo que promociona en ese enlace.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">5. Contenido prohibido</h2>
            <p>
              No está permitido usar Bioly para distribuir contenido ilegal, que infrinja derechos de terceros, que
              constituya fraude, o contenido para adultos que no cumpla con la legislación aplicable y con las
              políticas de nuestro proveedor de pagos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">6. Cambios</h2>
            <p>
              Podemos actualizar estos términos ocasionalmente. Si los cambios son significativos, te avisaremos
              por el correo asociado a tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">7. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos términos, puedes escribirnos a través de los canales de soporte
              indicados en el sitio.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
