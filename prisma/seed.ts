// Carga el contenido inicial. Es idempotente: no sobrescribe lo que ya fue editado en /admin.
import { PrismaClient } from "@prisma/client";
import { generalFaqs, services } from "./seed-data";

const db = new PrismaClient();

// Orden de FAQs de inicio según el brief (sección 4.10)
const homeFaqOrder = [
  "¿Qué tipo de software desarrolla Estratec?",
  "¿Pueden desarrollar una solución desde cero?",
  "¿Pueden integrar un sistema que ya utilizamos?",
  "¿Qué tipo de APIs e integraciones pueden realizar?",
  "¿Implementan Kommo y GoHighLevel?",
  "¿Pueden desarrollar aplicaciones para Android y iOS?",
  "¿Qué información necesitan para cotizar un proyecto?",
  "¿Cómo funciona una primera consultoría?",
  "¿Pueden crear dinámicas de gamificación para eventos o capacitaciones?",
];

async function main() {
  for (const [i, s] of services.entries()) {
    const exists = await db.service.findUnique({ where: { slug: s.slug } });
    if (exists) continue;
    await db.service.create({
      data: {
        slug: s.slug, name: s.name, shortName: s.shortName, icon: s.icon, summary: s.summary, h1: s.h1,
        intro: s.intro, problem: s.problem, includes: s.includes, solutions: s.solutions,
        deliverables: s.deliverables, forWho: s.forWho, ctaLabel: s.ctaLabel, whatsappText: s.whatsappText,
        order: i + 1, status: "PUBLISHED",
        seo: { title: s.seoTitle, description: s.seoDescription },
      },
    });
    console.log("Servicio creado:", s.slug);
  }

  if ((await db.faq.count()) === 0) {
    const all = await db.service.findMany({ select: { id: true, slug: true } });
    const idBySlug = new Map(all.map((s) => [s.slug, s.id]));
    const rows = [
      ...services.flatMap((s) => s.faqs.map((f) => ({ ...f, serviceId: idBySlug.get(s.slug) ?? null }))),
      ...generalFaqs.map((f) => ({ ...f, serviceId: null })),
    ];
    for (const f of rows) {
      const homeIdx = homeFaqOrder.indexOf(f.q);
      await db.faq.create({
        data: {
          question: f.q, answer: f.a, serviceId: f.serviceId, status: "PUBLISHED",
          showOnHome: homeIdx >= 0, order: homeIdx >= 0 ? homeIdx + 1 : 50,
        },
      });
    }
    console.log(`FAQs creadas: ${rows.length}`);
  }
}

main().finally(() => db.$disconnect());
