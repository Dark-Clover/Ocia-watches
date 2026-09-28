"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/motion";
import { site } from "@/lib/site";

const SERVICES = [
  { title: "Complimentary engraving", text: "Casebacks engraved with a date, initials or a few words." },
  { title: "Two-year warranty", text: "International cover, with servicing handled by our studio." },
  { title: "Delivered in 48 hours", text: "Insured express delivery across Pakistan, gift-wrapped." },
  { title: "Private viewing", text: "See the collection in person at the studio, by appointment." },
];

export function Closing() {
  return (
    <section data-theme="light" className="bg-ivory pb-32 pt-24 md:pb-44" aria-label="Services">
      <Marquee className="border-y border-ink/10 py-8 md:py-12" speed={2}>
        {[...Array(3)].map((_, i) => (
          <span key={i} className="display flex items-center whitespace-nowrap pr-16 text-[clamp(3rem,9vw,9.5rem)]">
            {site.line}
            <span className="mx-16 inline-block h-3 w-3 rounded-full border border-ink/40" />
            <em>Lifestyle Essentials</em>
            <span className="mx-16 inline-block h-3 w-3 rounded-full border border-ink/40" />
          </span>
        ))}
      </Marquee>

      <div className="container-x mt-24 grid gap-12 md:mt-32 md:grid-cols-4 md:gap-8">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08} className="border-t border-ink/15 pt-6">
            <span className="eyebrow text-[0.625rem] text-stone">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="serif mt-6 text-2xl">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-stone">{s.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="container-x mt-24 flex flex-col items-center text-center md:mt-36">
        <p className="eyebrow text-stone">Visit</p>
        <h2 className="display mt-6 max-w-4xl text-[clamp(2.75rem,6vw,6rem)]">See them in person, in the quiet of the studio.</h2>
        <ButtonLink href="/contact?topic=viewing" className="mt-12">
          Book a private viewing
        </ButtonLink>
      </Reveal>
    </section>
  );
}
