import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Política de privacidad | Bioly",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#111111] dark:text-[#f4f4f5]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Política de privacidad</h1>
        <p className="text-sm text-[#999999] mb-10">Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-[#333333] dark:text-[#d4d4d8] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">1. Qué datos recopilamos</h2>
            <p>
              Cuando creas una cuenta recopilamos tu email, nombre y foto de perfil (si te registras con Google), y
              la información que agregues a tu página pública (nombre, biografía, enlaces, imágenes). Cuando alguien
              visita una página de Bioly, registramos datos básicos de analítica (vistas, clics, país aproximado,
              dispositivo y referente) para mostrarle estadísticas al dueño de la página. Cuando alguien paga por un
              enlace privado, guardamos su email y el nombre de Telegram que proporcione, para gestionar el acceso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">2. Cookies</h2>
            <p>
              Usamos cookies y almacenamiento local del navegador para mantener tu sesión iniciada, recordar tus
              preferencias (como el tema claro/oscuro) y, en el caso de enlaces privados, recordar el email con el
              que ya desbloqueaste un enlace para no pedírtelo de nuevo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">3. Con quién compartimos datos</h2>
            <p>
              Usamos proveedores externos para operar el servicio: Supabase (base de datos y autenticación),
              Vercel (hosting) y Lemon Squeezy (procesamiento de pagos). Estos proveedores procesan datos en
              nuestro nombre bajo sus propias políticas de privacidad y seguridad. No vendemos tus datos a
              terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">4. Tus derechos</h2>
            <p>
              Puedes acceder, corregir o eliminar la información de tu perfil en cualquier momento desde tu panel
              de control. Si quieres eliminar tu cuenta por completo o tienes dudas sobre tus datos, contáctanos a
              través de los canales de soporte indicados en el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">5. Seguridad</h2>
            <p>
              Tomamos medidas razonables para proteger tu información (cifrado en tránsito, control de acceso a la
              base de datos). Ningún sistema es 100% infalible, pero trabajamos activamente para mantener la
              plataforma segura.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mb-2">6. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. La fecha de la última actualización aparece al
              inicio de esta página.
            </p>
          </section>

          <p className="text-sm text-[#999999]">
            Consulta también nuestros <Link href="/terminos" className="underline">Términos de servicio</Link> y
            nuestra <Link href="/reembolsos" className="underline">Política de reembolsos</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
