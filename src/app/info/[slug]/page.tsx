import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TextLink } from "@/components/ui/Button";
import { Reveal, SplitReveal } from "@/components/ui/motion";
import { INFO } from "@/lib/content/info";

export function generateStaticParams() {
  return Object.keys(INFO).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/info/[slug]">): Promise<Metadata> {
  const page = INFO[(await params).slug];
  return page ? { title: page.title } : {};
}

export default async function InfoPage({ params }: PageProps<"/info/[slug]">) {
  const page = INFO[(await params).slug];
  if (!page) notFound();
  return (
    <div data-theme="light" className="bg-ivory">
      <section className="container-x pb-32 pt-40 md:pb-48 md:pt-52">
        <p className="eyebrow text-stone">{page.kicker}</p>
        <SplitReveal as="h1" text={page.title} className="display mt-8 text-[clamp(3.5rem,9vw,9rem)]" />
        <div className="mt-20 grid gap-16 lg:grid-cols-12">
          <div className="space-y-14 lg:col-span-7 lg:col-start-6">
            {page.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 0.06} className="grid gap-4 border-t border-ink/15 pt-8 md:grid-cols-[3rem_1fr]">
                <span className="eyebrow text-[0.625rem] text-stone">0{i + 1}</span>
                <div>
                  <h2 className="serif text-3xl">{s.heading}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">{s.body}</p>
                </div>
              </Reveal>
            ))}
            <TextLink href="/contact">Still have a question?</TextLink>
          </div>
        </div>
      </section>
    </div>
  );
}
