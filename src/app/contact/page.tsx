import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { Accordion } from "@/components/ui/Accordion";
import { EditorialFigure } from "@/components/ui/EditorialFigure";
import { LiveClock, VisitorCity } from "@/components/ui/LiveClock";
import { Reveal, SplitReveal } from "@/components/ui/motion";
import { editorial } from "@/lib/editorial";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to OCIA, or book a private viewing at the studio.",
};

const FAQ = [
  { title: "How do I choose a size?", content: "As a guide, 32–34 mm suits a slimmer wrist or a dress watch; 36–38 mm sits comfortably on most wrists; 40 mm reads as a classic sports size. We're happy to advise from a photo of your wrist." },
  { title: "Can I change the strap?", content: "Every OCIA strap is quick-release. Swap between leather, suede, mesh and bracelet in seconds, without tools." },
  { title: "Do you deliver outside Pakistan?", content: "Yes. International delivery takes 3–6 working days, fully insured, with duties calculated at checkout." },
  { title: "What does the warranty cover?", content: "Two years, internationally, covering the movement and any manufacturing defect. Straps and crystal damage from impact are not covered." },
  { title: "Can I see a watch before buying?", content: "Book a private viewing at the studio. We'll prepare the pieces you're interested in, and there's no obligation to buy." },
];

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { topic } = await searchParams;
  return (
    <div data-theme="light" className="bg-ivory">
      <section className="container-x grid gap-16 pb-32 pt-40 md:pt-52 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow text-stone">Contact</p>
          </Reveal>
          <SplitReveal as="h1" text={"Write to us."} className="display mt-8 text-[clamp(3.5rem,9vw,9rem)]" />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-stone">
              Questions about a watch, an order, or a gift. Or come and see the collection at the studio, by appointment.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ink/15 pt-10">
            <div>
              <p className="eyebrow text-[0.5625rem] text-stone">Email</p>
              <a href={`mailto:${site.email}`} className="link-draw mt-3 inline-block text-sm">{site.email}</a>
            </div>
            <div>
              <p className="eyebrow text-[0.5625rem] text-stone">Telephone</p>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="link-draw mt-3 inline-block text-sm">{site.phone}</a>
            </div>
            <div>
              <p className="eyebrow text-[0.5625rem] text-stone">WhatsApp</p>
              <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`} className="link-draw mt-3 inline-block text-sm" target="_blank" rel="noreferrer">
                {site.whatsapp}
              </a>
            </div>
            <div>
              <p className="eyebrow text-[0.5625rem] text-stone">
                In <VisitorCity fallback="your city" /> it is
              </p>
              <LiveClock className="mt-3 block text-sm" />
            </div>
            <div className="col-span-2">
              <p className="eyebrow text-[0.5625rem] text-stone">{site.studio.name}</p>
              <p className="mt-3 text-sm leading-relaxed">
                {site.studio.lines.join(", ")}
                <br />
                <span className="text-stone">{site.studio.hours}</span>
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7 lg:pt-28">
          <ContactForm topic={typeof topic === "string" ? topic : undefined} />
        </Reveal>
      </section>

      <section className="container-x grid gap-12 pb-32 md:pb-48 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-stone">Before you ask</p>
          <SplitReveal as="h2" text="Questions, answered." className="display mt-6 text-[clamp(2.75rem,5vw,5rem)]" />
          <EditorialFigure photo={editorial.boxed} sizes="(min-width: 1024px) 35vw, 100vw" aspect="aspect-square" className="mt-14 lg:w-4/5" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Accordion items={FAQ} />
        </div>
      </section>
    </div>
  );
}
