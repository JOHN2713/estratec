import { getBlock } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { getHomeFaqs, getProjects, getServices } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import { waLink } from "@/lib/whatsapp";
import { JsonLd } from "@/components/ui/JsonLd";
import { LeadForm } from "@/components/site/LeadForm";
import {
  CapabilityStrip, Closing, FaqSection, Hero, Objectives, Problems, Process, ProjectsSection, ServicesGrid, Why,
} from "@/components/site/sections";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMetadata({ path: "/", absoluteTitle: true });
}

export default async function HomePage() {
  const [home, settings, services, faqs, projects] = await Promise.all([
    getBlock("home"),
    getSettings(),
    getServices(),
    getHomeFaqs(),
    getProjects(),
  ]);
  const { contact, social, org, cta } = settings;
  const wa = waLink(contact.whatsappNumber, cta.whatsappGeneralText);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl()}/#organization`,
    name: "Estratec",
    ...(org.legalName ? { legalName: org.legalName } : {}),
    url: siteUrl(),
    logo: siteUrl("/assets/brand/mascota.png"),
    description: org.longDescription || org.shortDescription,
    email: contact.email,
    telephone: `+${contact.whatsappNumber}`,
    areaServed: { "@type": "Place", name: org.areaServed || "Latinoamérica" },
    knowsLanguage: "es",
    sameAs: [social.instagramUrl, social.tiktokUrl].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: `+${contact.whatsappNumber}`,
      email: contact.email,
      availableLanguage: ["es"],
      areaServed: org.areaServed || "Latinoamérica",
    },
    makesOffer: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, url: siteUrl(`/servicios/${s.slug}`) },
    })),
  };
  const siteLd = { "@context": "https://schema.org", "@type": "WebSite", name: settings.seo.siteName, url: siteUrl(), inLanguage: "es" };
  const faqLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }
    : null;

  return (
    <>
      <JsonLd data={orgLd} />
      <JsonLd data={siteLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <Hero hero={home.hero} />
      <CapabilityStrip items={home.capabilities} />
      <Problems data={home.problems} services={services} />
      <ServicesGrid data={home.services} services={services} whatsappNumber={contact.whatsappNumber} waEnabled={cta.whatsappEnabled} />
      <Objectives data={home.objectives} />
      <Process data={home.process} />
      <ProjectsSection data={home.projects} projects={projects} />
      <Why data={home.why} />
      <FaqSection data={home.faq} faqs={faqs} />
      <Closing data={home.closing} waHref={wa} waEnabled={cta.whatsappEnabled}>
        <LeadForm
          services={services.map((s) => ({ slug: s.slug, name: s.name }))}
          whatsappHref={wa}
          disabledText={cta.formEnabled ? null : cta.formDisabledText}
        />
      </Closing>
    </>
  );
}
