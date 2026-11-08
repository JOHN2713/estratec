import "server-only";
import { cache } from "react";
import { z } from "zod";
import { db } from "./db";

const t = (max: number) => z.string().trim().max(max);
const item = z.object({ title: t(120).min(1), text: t(600) });

export const blockSchemas = {
  home: z.object({
    hero: z.object({
      eyebrow: t(120),
      title: t(160).min(1),
      subtitle: t(600).min(1),
      ctaPrimary: t(60).min(1),
      ctaSecondary: t(60).min(1),
      coreLabels: z.array(t(40)).max(8),
    }),
    capabilities: z.array(t(60)).max(10),
    problems: z.object({
      title: t(160),
      intro: t(500),
      items: z.array(item.extend({ serviceSlugs: z.array(t(120)).max(4) })).max(10),
    }),
    services: z.object({ eyebrow: t(60), title: t(160), intro: t(500) }),
    objectives: z.object({
      eyebrow: t(60),
      title: t(160),
      intro: t(500),
      items: z.array(item.extend({ serviceSlug: t(120) })).max(8),
    }),
    process: z.object({ eyebrow: t(60), title: t(160), intro: t(500), note: t(300), steps: z.array(item).min(1).max(8) }),
    projects: z.object({ eyebrow: t(60), title: t(160), intro: t(500), emptyTitle: t(160), emptyText: t(500) }),
    why: z.object({ eyebrow: t(60), title: t(160), intro: t(600), items: z.array(item).max(8) }),
    faq: z.object({ eyebrow: t(60), title: t(160), intro: t(500) }),
    closing: z.object({ title: t(160), text: t(500), ctaPrimary: t(60), ctaWhatsapp: t(60) }),
  }),
  privacy: z.object({
    title: t(160).min(1),
    version: t(20).min(1),
    updated: t(40),
    body: z.string().max(30000),
  }),
  terms: z.object({
    enabled: z.boolean(),
    title: t(160).min(1),
    updated: t(40),
    body: z.string().max(30000),
  }),
} as const;

export type BlockKey = keyof typeof blockSchemas;
export type Blocks = { [K in BlockKey]: z.infer<(typeof blockSchemas)[K]> };

export const blockDefaults: Blocks = {
  home: {
    hero: {
      eyebrow: "Consultoría estratégica + ejecución tecnológica",
      title: "De la estrategia a la tecnología que transforma tu negocio.",
      subtitle:
        "Te ayudamos a identificar oportunidades, definir soluciones y llevarlas a la práctica. Desarrollamos software a medida, aplicaciones web y móviles, sitios web, integraciones API, soluciones CRM y experiencias de gamificación para resolver necesidades reales de tu negocio.",
      ctaPrimary: "Agenda una consultoría",
      ctaSecondary: "Explora nuestros servicios",
      coreLabels: ["Software", "Datos", "Automatización", "Integración", "CRM", "Gamificación"],
    },
    capabilities: [
      "Software a medida",
      "Aplicaciones web y móviles",
      "APIs e integraciones",
      "CRM y automatización",
      "Gamificación",
      "Consultoría tecnológica",
    ],
    problems: {
      title: "Tu negocio tiene retos. La tecnología debe ayudarte a resolverlos.",
      intro: "Empezamos por entender qué está frenando a tu operación. Estas son algunas situaciones que resolvemos con frecuencia.",
      items: [
        { title: "Procesos manuales que consumen tiempo", text: "Tareas repetitivas, hojas de cálculo y pasos que dependen de una persona.", serviceSlugs: ["software-a-medida", "apis-integraciones-automatizacion"] },
        { title: "Información dispersa entre herramientas", text: "Datos repartidos en correos, archivos y sistemas que nadie consolida.", serviceSlugs: ["aplicaciones-web", "software-a-medida"] },
        { title: "Sistemas que no se comunican entre sí", text: "Plataformas aisladas que obligan a copiar y pegar información.", serviceSlugs: ["apis-integraciones-automatizacion"] },
        { title: "Seguimiento comercial desordenado", text: "Prospectos que se pierden, conversaciones sin registro y ventas difíciles de medir.", serviceSlugs: ["implementacion-crm-kommo-gohighlevel"] },
        { title: "Necesidad de digitalizar una operación", text: "Un servicio o proceso que hoy funciona en papel o de forma presencial.", serviceSlugs: ["aplicaciones-web", "aplicaciones-moviles", "consultoria-tecnologica"] },
        { title: "Poca participación en capacitaciones o eventos", text: "Experiencias que no logran motivar ni mantener la atención de las personas.", serviceSlugs: ["gamificacion-empresarial"] },
      ],
    },
    services: {
      eyebrow: "Servicios",
      title: "Soluciones tecnológicas para cada etapa de tu negocio.",
      intro: "Ocho líneas de servicio que se combinan según tu necesidad: desde definir el camino hasta construir, integrar y poner en marcha la solución.",
    },
    objectives: {
      eyebrow: "Soluciones por objetivo",
      title: "¿Sabes qué quieres lograr, pero no qué servicio necesitas?",
      intro: "Elige tu objetivo y te mostramos por dónde empezar.",
      items: [
        { title: "Digitalizar", text: "Convertir procesos manuales en plataformas y sistemas.", serviceSlug: "software-a-medida" },
        { title: "Conectar", text: "Integrar herramientas, APIs y bases de datos.", serviceSlug: "apis-integraciones-automatizacion" },
        { title: "Automatizar", text: "Reducir tareas repetitivas y mejorar flujos.", serviceSlug: "apis-integraciones-automatizacion" },
        { title: "Atraer y convertir", text: "Crear sitios web y landing pages enfocadas en captación.", serviceSlug: "diseno-desarrollo-web" },
        { title: "Organizar ventas", text: "Implementar y optimizar CRM.", serviceSlug: "implementacion-crm-kommo-gohighlevel" },
        { title: "Motivar y participar", text: "Diseñar experiencias de gamificación.", serviceSlug: "gamificacion-empresarial" },
      ],
    },
    process: {
      eyebrow: "Cómo trabajamos",
      title: "Te acompañamos desde la estrategia hasta la implementación.",
      intro: "Entender, orientar, construir y acompañar: un ciclo claro en el que sabes qué se hace en cada etapa y qué recibes.",
      note: "Los tiempos y el alcance se definen después de evaluar cada proyecto.",
      steps: [
        { title: "Descubrimiento", text: "Entendemos el negocio, el problema y los usuarios." },
        { title: "Estrategia y alcance", text: "Priorizamos funcionalidades, definimos objetivos y entregables." },
        { title: "Diseño de solución", text: "Estructuramos la experiencia, los flujos y la arquitectura." },
        { title: "Desarrollo e integración", text: "Construimos, conectamos y validamos la solución." },
        { title: "Pruebas y lanzamiento", text: "Verificamos el funcionamiento y acompañamos la puesta en producción." },
        { title: "Mejora continua", text: "Evaluamos necesidades y oportunidades de evolución." },
      ],
    },
    projects: {
      eyebrow: "Proyectos",
      title: "Proyectos y experiencias",
      intro: "Casos en los que llevamos una necesidad de negocio a una solución en funcionamiento.",
      emptyTitle: "¿Tienes un proyecto en mente?",
      emptyText: "Estamos preparando la publicación de nuestros casos. Mientras tanto, cuéntanos tu reto y conversemos sobre cómo abordarlo.",
    },
    why: {
      eyebrow: "Nosotros",
      title: "Un aliado tecnológico, desde la idea hasta la implementación.",
      intro:
        "Estratec une visión de negocio y capacidad técnica. No somos una consultora que solo entrega recomendaciones ni una fábrica de software que solo vende horas: entendemos tu contexto, te ayudamos a decidir y construimos la solución contigo.",
      items: [
        { title: "Alineados con tu negocio", text: "Cada solución responde a objetivos concretos de tu organización." },
        { title: "Visión completa", text: "Desarrollo e integración pensados como un solo sistema, no como piezas sueltas." },
        { title: "Acompañamiento en decisiones", text: "Te orientamos antes de invertir en herramientas o desarrollo." },
        { title: "Comunicación clara", text: "Alcance, prioridades y entregables definidos con transparencia." },
        { title: "Preparadas para evolucionar", text: "Soluciones que pueden crecer junto con tu operación." },
      ],
    },
    faq: { eyebrow: "Preguntas frecuentes", title: "Lo que suelen preguntarnos", intro: "" },
    closing: {
      title: "¿Tienes un reto tecnológico? Conversemos.",
      text: "Cuéntanos qué necesitas mejorar, automatizar o desarrollar. Revisaremos tu requerimiento y te orientaremos sobre los siguientes pasos.",
      ctaPrimary: "Agendar una consultoría",
      ctaWhatsapp: "Escribir por WhatsApp",
    },
  },
  privacy: {
    title: "Política de privacidad",
    version: "borrador-1",
    updated: "",
    body: `> **Borrador pendiente de aprobación.** Este texto es una base de trabajo y debe ser revisado y aprobado por Estratec (y, de ser necesario, por asesoría legal) antes de publicarse como versión definitiva.

## Responsable del tratamiento

Estratec ("nosotros") es responsable de los datos personales que recibimos a través de este sitio web. Puedes contactarnos en el correo indicado al pie de esta página.

## Datos que recopilamos

Cuando completas el formulario de solicitud de asesoría recopilamos: nombre y apellido, correo electrónico, teléfono / WhatsApp, empresa (opcional), servicio de interés, el mensaje que nos envías, tu preferencia de contacto y, si los indicas, país o zona horaria y fecha/franja horaria preferidas.

También registramos datos técnicos de la solicitud, como la página desde la que se envió y los parámetros de campaña (UTM) cuando existen.

## Para qué usamos tus datos

- Responder a tu solicitud y coordinar una posible consultoría.
- Dar seguimiento comercial a tu requerimiento.
- Mejorar nuestros servicios y la atención que brindamos.

No vendemos tus datos ni los compartimos con terceros para fines publicitarios.

## Analítica

Si aceptas el uso de cookies de analítica, utilizamos herramientas como Google Analytics para conocer de forma agregada cómo se usa el sitio. No enviamos a estas herramientas tu nombre, correo, teléfono ni el contenido de tus mensajes.

## Conservación

Conservamos tus datos mientras sea necesario para gestionar tu solicitud y la relación comercial, o hasta que solicites su eliminación.

## Tus derechos

Puedes solicitar el acceso, la actualización o la eliminación de tus datos escribiéndonos al correo de contacto. Atenderemos tu solicitud en un plazo razonable.

## Cambios

Podemos actualizar esta política. La versión vigente estará siempre disponible en esta página.`,
  },
  terms: {
    enabled: false,
    title: "Términos de uso",
    updated: "",
    body: "",
  },
};

function merge<K extends BlockKey>(key: K, stored: unknown): Blocks[K] {
  const base = blockDefaults[key];
  if (!stored || typeof stored !== "object") return base;
  const parsed = blockSchemas[key].safeParse({ ...base, ...(stored as object) });
  return parsed.success ? (parsed.data as Blocks[K]) : base;
}

export const getBlock = cache(async <K extends BlockKey>(key: K): Promise<Blocks[K]> => {
  try {
    const row = await db.contentBlock.findUnique({ where: { key } });
    return merge(key, row?.data);
  } catch (e) {
    console.error("[content] BD no disponible, usando contenido por defecto", (e as Error).message);
    return blockDefaults[key];
  }
});
