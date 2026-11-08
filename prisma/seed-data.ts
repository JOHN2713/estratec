// Contenido inicial basado en el brief v2. Todo es editable desde /admin.
// No incluye clientes, cifras, certificaciones ni alianzas no confirmadas.

export type SeedService = {
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  summary: string;
  h1: string;
  intro: string;
  problem: string;
  includes: string[];
  solutions: string[];
  deliverables: string[];
  forWho: string;
  ctaLabel: string;
  whatsappText: string;
  seoTitle: string;
  seoDescription: string;
  faqs: { q: string; a: string }[];
};

export const services: SeedService[] = [
  {
    slug: "software-a-medida",
    name: "Desarrollo de software a medida",
    shortName: "Software a medida",
    icon: "Boxes",
    summary: "Sistemas adaptados a los flujos, reglas y objetivos de tu organización, sin obligarte a trabajar con procesos que no se ajustan a tu operación.",
    h1: "Desarrollo de software a medida para tu empresa",
    intro: "Diseñamos y construimos sistemas adaptados a los flujos, reglas y objetivos de cada organización. Evitamos obligar al negocio a trabajar con procesos que no se ajustan a su operación.",
    problem: "Muchas empresas operan con herramientas genéricas que no se adaptan a su forma de trabajar, o con hojas de cálculo y procesos manuales que crecen hasta volverse difíciles de controlar. El resultado es tiempo perdido, errores y poca visibilidad sobre lo que ocurre en la operación.",
    includes: [
      "Levantamiento de requerimientos y análisis de procesos.",
      "Diseño de la arquitectura y de la experiencia de uso.",
      "Desarrollo de módulos, roles y permisos.",
      "Integración con sistemas o herramientas existentes cuando se requiera.",
      "Pruebas, puesta en marcha y acompañamiento inicial.",
    ],
    solutions: ["Sistemas de gestión", "Plataformas internas", "Módulos administrativos", "Portales", "Dashboards", "Herramientas de seguimiento", "Digitalización de procesos"],
    deliverables: [
      "Documento de alcance y prioridades.",
      "Software funcionando en el entorno acordado.",
      "Accesos, documentación de uso y traspaso de conocimiento.",
    ],
    forWho: "Empresas pequeñas y medianas, equipos y organizaciones que necesitan un sistema que responda a su operación real y que pueda crecer con ella.",
    ctaLabel: "Quiero desarrollar un sistema a medida",
    whatsappText: "Hola, Estratec. Quiero información sobre el desarrollo de un software a medida para mi negocio.",
    seoTitle: "Desarrollo de software a medida en Latinoamérica",
    seoDescription: "Diseñamos y desarrollamos software a medida: sistemas de gestión, plataformas internas, portales y dashboards adaptados a los procesos de tu empresa.",
    faqs: [
      { q: "¿Qué tipo de software desarrolla Estratec?", a: "Desarrollamos sistemas de gestión, plataformas internas, módulos administrativos, portales, dashboards y herramientas de seguimiento adaptadas a los procesos de cada organización." },
      { q: "¿Pueden desarrollar una solución desde cero?", a: "Sí. Podemos diseñar y construir una solución desde cero o evolucionar un sistema existente. Lo definimos después de entender tu necesidad y tu contexto." },
    ],
  },
  {
    slug: "aplicaciones-web",
    name: "Aplicaciones web",
    shortName: "Aplicaciones web",
    icon: "AppWindow",
    summary: "Aplicaciones accesibles desde el navegador para gestionar información, usuarios, operaciones y procesos desde una plataforma centralizada.",
    h1: "Desarrollo de aplicaciones web para empresas",
    intro: "Construimos aplicaciones accesibles desde el navegador para gestionar información, usuarios, operaciones y procesos desde una plataforma centralizada.",
    problem: "Cuando la información vive en archivos y correos, coordinar a clientes, colaboradores y procesos se vuelve lento. Una aplicación web centraliza la operación y permite acceder desde cualquier lugar, sin instalaciones.",
    includes: [
      "Definición de usuarios, roles y flujos principales.",
      "Diseño de interfaz centrado en la facilidad de uso.",
      "Desarrollo frontend y backend.",
      "Conexión con bases de datos, servicios o APIs.",
      "Pruebas y publicación.",
    ],
    solutions: ["Portales de clientes", "Plataformas administrativas", "Sistemas de reservas", "Formularios inteligentes", "Paneles de control", "Aplicaciones empresariales"],
    deliverables: ["Aplicación web publicada en el entorno acordado.", "Panel de administración cuando aplique.", "Documentación de uso."],
    forWho: "Negocios que necesitan centralizar su operación, ofrecer autoservicio a sus clientes o reemplazar procesos manuales por una plataforma.",
    ctaLabel: "Cuéntanos qué aplicación necesitas",
    whatsappText: "Hola, Estratec. Estoy interesado/a en desarrollar una aplicación web. Quisiera conversar sobre mi proyecto.",
    seoTitle: "Desarrollo de aplicaciones web para empresas",
    seoDescription: "Aplicaciones web a medida: portales de clientes, plataformas administrativas, sistemas de reservas y paneles de control para tu negocio.",
    faqs: [
      { q: "¿Qué diferencia hay entre una aplicación web y una página web?", a: "Una página web comunica y capta contactos; una aplicación web permite que los usuarios realicen tareas: gestionar información, reservar, consultar estados o administrar procesos." },
    ],
  },
  {
    slug: "aplicaciones-moviles",
    name: "Aplicaciones móviles",
    shortName: "Aplicaciones móviles",
    icon: "Smartphone",
    summary: "Experiencias móviles para clientes, colaboradores o usuarios que necesitan acceder a servicios y procesos desde su teléfono.",
    h1: "Desarrollo de aplicaciones móviles Android y iOS",
    intro: "Diseñamos y desarrollamos experiencias móviles para clientes, colaboradores o usuarios que necesitan acceder a servicios y procesos desde su teléfono.",
    problem: "Tus clientes o tu equipo pasan buena parte del día en el teléfono. Si un servicio o proceso no está disponible ahí, se pierden oportunidades de atención, autoservicio y comunicación oportuna.",
    includes: [
      "Definición de la experiencia y de las funciones prioritarias.",
      "Diseño de interfaz móvil.",
      "Desarrollo para Android y iOS según el alcance.",
      "Conexión con servicios web o sistemas existentes.",
      "Acompañamiento en la publicación en tiendas cuando aplique.",
    ],
    solutions: ["Aplicaciones para Android y iOS", "Apps de gestión", "Autoservicio", "Notificaciones", "Conexión con servicios web o sistemas existentes"],
    deliverables: ["Aplicación funcional para las plataformas acordadas.", "Backend o integraciones necesarias.", "Guía de uso y publicación."],
    forWho: "Empresas que quieren ofrecer servicios desde el teléfono a sus clientes o equipar a sus colaboradores con herramientas móviles.",
    ctaLabel: "Hablemos de tu aplicación móvil",
    whatsappText: "Hola, Estratec. Quiero conocer las opciones para desarrollar una aplicación móvil.",
    seoTitle: "Desarrollo de aplicaciones móviles Android y iOS",
    seoDescription: "Desarrollamos aplicaciones móviles para Android y iOS: apps de gestión, autoservicio y notificaciones conectadas a tus sistemas.",
    faqs: [
      { q: "¿Pueden desarrollar aplicaciones para Android y iOS?", a: "Sí. Desarrollamos aplicaciones para Android y iOS. La tecnología y el enfoque se definen según el alcance, el presupuesto y las funciones que necesites." },
    ],
  },
  {
    slug: "diseno-desarrollo-web",
    name: "Diseño y desarrollo de páginas web",
    shortName: "Páginas web",
    icon: "MonitorSmartphone",
    summary: "Sitios corporativos y landing pages enfocadas en comunicar valor, generar confianza y convertir visitas en oportunidades comerciales.",
    h1: "Diseño y desarrollo de páginas web que convierten",
    intro: "Creamos sitios corporativos, páginas de aterrizaje y experiencias web enfocadas en comunicar valor, generar confianza y convertir visitas en oportunidades comerciales.",
    problem: "Un sitio que no explica con claridad qué haces, que carga lento o que no invita a dar el siguiente paso, deja ir a los clientes potenciales. La web debe trabajar como un canal comercial.",
    includes: [
      "Estructura de contenidos orientada a conversión.",
      "Diseño visual alineado con tu marca.",
      "Desarrollo responsive y optimizado para buscadores.",
      "Formularios de captación y botones de contacto.",
      "Panel administrable cuando se requiera.",
    ],
    solutions: ["Páginas corporativas", "Landing pages para campañas", "Páginas de servicios", "Formularios de captación", "Sitios administrables"],
    deliverables: ["Sitio publicado y optimizado.", "Configuración básica de SEO.", "Accesos y guía de administración."],
    forWho: "Emprendedores, empresas y organizaciones que necesitan una presencia digital profesional que genere contactos.",
    ctaLabel: "Quiero una página web que convierta",
    whatsappText: "Hola, Estratec. Necesito una página web para mi negocio y quisiera recibir asesoría.",
    seoTitle: "Diseño y desarrollo de páginas web para empresas",
    seoDescription: "Diseñamos páginas web corporativas y landing pages enfocadas en conversión, rápidas, administrables y optimizadas para buscadores.",
    faqs: [
      { q: "¿La página web será administrable?", a: "Podemos entregar un sitio administrable para que tu equipo actualice textos, servicios e imágenes sin depender de un desarrollador. Lo definimos en el alcance." },
    ],
  },
  {
    slug: "apis-integraciones-automatizacion",
    name: "APIs, integraciones y automatización",
    shortName: "APIs e integraciones",
    icon: "Workflow",
    summary: "Conectamos plataformas y sistemas para reducir tareas manuales, sincronizar información y construir flujos de trabajo más eficientes.",
    h1: "APIs, integraciones y automatización de procesos",
    intro: "Conectamos plataformas y sistemas para reducir tareas manuales, sincronizar información y construir flujos de trabajo más eficientes.",
    problem: "Cuando los sistemas no se comunican, el equipo termina copiando información entre plataformas, con retrasos y errores. Las integraciones permiten que los datos fluyan solos entre las herramientas que ya usas.",
    includes: [
      "Análisis de los sistemas y del flujo de información.",
      "Diseño de la integración o de la API.",
      "Desarrollo y consumo de APIs, webhooks y conectores.",
      "Automatización de tareas repetitivas.",
      "Monitoreo y documentación técnica.",
    ],
    solutions: ["Desarrollo y consumo de APIs", "Integración entre sistemas", "Automatización de procesos", "Sincronización de datos", "Webhooks", "Conectores personalizados"],
    deliverables: ["Integración o API funcionando.", "Documentación técnica.", "Recomendaciones de mantenimiento."],
    forWho: "Organizaciones que usan varias herramientas o sistemas y necesitan que trabajen de forma conectada.",
    ctaLabel: "Quiero conectar mis sistemas",
    whatsappText: "Hola, Estratec. Necesito conectar sistemas o desarrollar una integración mediante API.",
    seoTitle: "Desarrollo de APIs, integraciones y automatización",
    seoDescription: "Desarrollamos APIs, integraciones entre sistemas, webhooks y automatizaciones para sincronizar datos y reducir tareas manuales.",
    faqs: [
      { q: "¿Pueden integrar un sistema que ya utilizamos?", a: "En la mayoría de los casos, sí. Revisamos si el sistema ofrece una API, webhooks u otro mecanismo de conexión y proponemos la alternativa más adecuada." },
      { q: "¿Qué tipo de APIs e integraciones pueden realizar?", a: "Desarrollamos APIs propias, consumimos APIs de terceros, configuramos webhooks, sincronizamos bases de datos y creamos conectores personalizados entre plataformas." },
    ],
  },
  {
    slug: "implementacion-crm-kommo-gohighlevel",
    name: "Implementación y optimización de CRM",
    shortName: "CRM",
    icon: "Contact",
    summary: "Configuración y adopción de plataformas CRM como Kommo y GoHighLevel para organizar prospectos, oportunidades y procesos comerciales.",
    h1: "Implementación de CRM con Kommo y GoHighLevel",
    intro: "Acompañamos la configuración y adopción de plataformas CRM para organizar prospectos, oportunidades, conversaciones y procesos comerciales. Trabajamos con plataformas como Kommo y GoHighLevel.",
    problem: "Sin un CRM bien configurado, los prospectos se pierden entre chats y hojas de cálculo, el seguimiento depende de la memoria de cada vendedor y es difícil saber qué está funcionando.",
    includes: [
      "Diagnóstico del proceso comercial actual.",
      "Configuración del embudo, etapas y campos.",
      "Automatizaciones y asignación de prospectos.",
      "Formularios, integraciones y plantillas de comunicación.",
      "Capacitación del equipo.",
    ],
    solutions: ["Configuración del embudo comercial", "Etapas y campos", "Automatizaciones", "Asignación de prospectos", "Formularios", "Integraciones", "Plantillas de comunicación", "Capacitación del equipo"],
    deliverables: ["CRM configurado según tu proceso.", "Automatizaciones activas.", "Sesiones de capacitación y guía de uso."],
    forWho: "Equipos comerciales y de marketing que quieren implementar un CRM o sacar más provecho del que ya tienen.",
    ctaLabel: "Quiero implementar o mejorar mi CRM",
    whatsappText: "Hola, Estratec. Quiero implementar o mejorar mi CRM con Kommo o GoHighLevel.",
    seoTitle: "Implementación de CRM Kommo y GoHighLevel",
    seoDescription: "Implementamos y optimizamos CRM con Kommo y GoHighLevel: embudos, automatizaciones, integraciones y capacitación para tu equipo comercial.",
    faqs: [
      { q: "¿Implementan Kommo y GoHighLevel?", a: "Sí. Trabajamos con Kommo y GoHighLevel: configuramos embudos, etapas, campos, automatizaciones e integraciones, y capacitamos a tu equipo." },
    ],
  },
  {
    slug: "gamificacion-empresarial",
    name: "Gamificación para empresas",
    shortName: "Gamificación",
    icon: "Gamepad2",
    summary: "Experiencias con dinámicas de juego para aumentar la participación, motivar comportamientos y hacer más atractivos los procesos empresariales.",
    h1: "Gamificación para empresas, eventos y capacitación",
    intro: "Diseñamos experiencias con dinámicas de juego para aumentar la participación, motivar comportamientos y hacer más atractivos determinados procesos empresariales.",
    problem: "Capacitaciones que no se terminan, eventos donde el público no interactúa o programas de fidelización que no generan interés: cuando falta motivación, la participación cae.",
    includes: [
      "Definición del objetivo y del comportamiento a motivar.",
      "Diseño de mecánicas, retos y recompensas.",
      "Desarrollo de la experiencia digital.",
      "Implementación en el evento, campaña o plataforma.",
      "Revisión de la participación al finalizar.",
    ],
    solutions: ["Capacitación", "Inducción", "Eventos", "Ferias", "Concursos", "Retos de conocimiento", "Fidelización", "Participación de clientes o colaboradores"],
    deliverables: ["Experiencia gamificada lista para usar.", "Panel o reporte de participación cuando aplique."],
    forWho: "Empresas interesadas en gamificación para capacitación, participación, eventos o fidelización.",
    ctaLabel: "Diseñemos una experiencia gamificada",
    whatsappText: "Hola, Estratec. Me interesa desarrollar una experiencia de gamificación para mi empresa o evento.",
    seoTitle: "Gamificación empresarial para eventos y capacitación",
    seoDescription: "Diseñamos experiencias de gamificación para capacitación, inducción, eventos, ferias, concursos y fidelización de clientes o colaboradores.",
    faqs: [
      { q: "¿Pueden crear dinámicas de gamificación para eventos o capacitaciones?", a: "Sí. Diseñamos retos, concursos y experiencias interactivas para eventos, ferias, capacitaciones e inducciones, adaptadas al objetivo de cada actividad." },
    ],
  },
  {
    slug: "consultoria-tecnologica",
    name: "Consultoría tecnológica",
    shortName: "Consultoría",
    icon: "Compass",
    summary: "Identificamos oportunidades, evaluamos alternativas y definimos una ruta tecnológica realista antes de invertir en herramientas o desarrollo.",
    h1: "Consultoría tecnológica para empresas",
    intro: "Te ayudamos a identificar oportunidades, evaluar alternativas y definir una ruta tecnológica realista antes de invertir en herramientas o desarrollo.",
    problem: "Elegir una herramienta o empezar un desarrollo sin un diagnóstico claro puede llevar a inversiones que no resuelven el problema real. La consultoría ordena las prioridades y reduce la incertidumbre.",
    includes: [
      "Levantamiento de requerimientos.",
      "Análisis de procesos.",
      "Arquitectura y selección de soluciones.",
      "Evaluación de herramientas.",
      "Planificación del proyecto de software.",
    ],
    solutions: ["Levantamiento de requerimientos", "Análisis de procesos", "Arquitectura y selección de soluciones", "Modernización", "Transformación digital", "Evaluación de herramientas", "Planificación de proyectos de software"],
    deliverables: ["Diagnóstico y recomendaciones.", "Ruta tecnológica priorizada.", "Propuesta de implementación, si decides avanzar con nosotros."],
    forWho: "Empresas y emprendedores que quieren tomar decisiones tecnológicas con criterio antes de invertir.",
    ctaLabel: "Agenda una consultoría tecnológica",
    whatsappText: "Hola, Estratec. Quiero agendar una consultoría tecnológica para revisar una necesidad de mi negocio.",
    seoTitle: "Consultoría tecnológica y transformación digital",
    seoDescription: "Consultoría tecnológica para empresas: análisis de procesos, levantamiento de requerimientos, selección de soluciones y planificación de proyectos.",
    faqs: [
      { q: "¿Cómo funciona una primera consultoría?", a: "Es una conversación para entender tu negocio, el reto que quieres resolver y tus prioridades. Con esa información te orientamos sobre las alternativas y los siguientes pasos." },
    ],
  },
];

export const generalFaqs: { q: string; a: string }[] = [
  { q: "¿Qué información necesitan para cotizar un proyecto?", a: "Nos ayuda conocer el objetivo del proyecto, el problema que quieres resolver, los usuarios que lo utilizarán, las herramientas que usas actualmente y una fecha estimada. Con eso podemos orientarte y, si corresponde, preparar una propuesta según el alcance." },
];
