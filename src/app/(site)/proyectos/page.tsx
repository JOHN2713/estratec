import { getBlock } from "@/lib/content";
import { getProjects } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";
import { ProjectCard, ProjectsSection } from "@/components/site/sections";

export const revalidate = 3600;

export async function generateMetadata() {
  const projects = await getProjects();
  return pageMetadata({
    path: "/proyectos",
    title: "Proyectos y experiencias",
    description: "Casos en los que Estratec llevó una necesidad de negocio a una solución tecnológica en funcionamiento.",
    // Sin casos publicados no se indexa una página vacía
    seo: projects.length ? undefined : { noindex: true },
  });
}

export default async function ProjectsPage() {
  const [home, projects] = await Promise.all([getBlock("home"), getProjects()]);
  return (
    <>
      <PageHeader crumbs={[{ name: "Proyectos", href: "/proyectos" }]} eyebrow={home.projects.eyebrow} title={home.projects.title} intro={home.projects.intro} />
      {projects.length > 0 ? (
        <section className="pb-24" aria-label="Listado de proyectos">
          <div className="container-site grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
          </div>
        </section>
      ) : (
        <ProjectsSection data={home.projects} projects={[]} />
      )}
    </>
  );
}
