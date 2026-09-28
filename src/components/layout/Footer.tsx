"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useActionState, useRef } from "react";
import { LiveClock, VisitorCity, VisitorCoordinates } from "@/components/ui/LiveClock";
import { useRange } from "@/components/ui/motion";
import { ArrowRight } from "@/components/ui/icons";
import { TLink } from "@/components/ui/TLink";
import { subscribe, type FormState } from "@/lib/actions/site";
import { nav, site } from "@/lib/site";

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["35%", "0%"]);
  const opacity = useRange(scrollYProgress, [0.3, 1], [0, 1]);
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, { status: "idle", message: "" });

  return (
    <footer ref={ref} data-theme="dark" className="relative overflow-hidden bg-ink text-ivory">
      <div className="container-x grid gap-16 pb-16 pt-24 md:pt-32 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <p className="eyebrow text-mist">The Letter</p>
          <h2 className="display mt-6 text-[clamp(2.5rem,4.6vw,4.5rem)]">Occasional notes on new pieces. Nothing else.</h2>
          <form action={action} className="mt-10 max-w-md">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <div className="group flex items-center border-b border-ivory/25 transition-colors focus-within:border-ivory">
              <input
                id="footer-email"
                name="email"
                type="email"
                required
                placeholder="Your email"
                className="w-full bg-transparent py-4 text-sm placeholder:text-mist focus:outline-none"
              />
              <button disabled={pending} aria-label="Subscribe" className="p-2">
                <ArrowRight className="h-5 w-5 transition-transform duration-500 group-focus-within:translate-x-1" />
              </button>
            </div>
            <p aria-live="polite" className="mt-3 min-h-5 text-xs text-mist">
              {state.message}
            </p>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {nav.footer.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-mist">{col.title}</p>
              <ul className="mt-6 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <TLink href={l.href} className="link-draw pb-0.5 text-sm text-ivory/85 hover:text-ivory">
                      {l.label}
                    </TLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="eyebrow text-mist">Studio</p>
            <ul className="mt-6 space-y-3 text-sm text-ivory/85">
              <li><a className="link-draw pb-0.5" href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a className="link-draw pb-0.5" href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a></li>
              {site.social.map((s) => (
                <li key={s.label}>
                  <a className="link-draw pb-0.5" href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="container-x">
        <div className="hairline" />
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 text-[0.6875rem] tracking-wide text-mist">
          <p>© {new Date().getFullYear()} OCIA. Lifestyle Essentials.</p>
          <p className="eyebrow text-[0.625rem]">
            <VisitorCoordinates /> · <VisitorCity /> <LiveClock seconds={false} className="ml-1 text-ivory" />
          </p>
          <p>Prices in PKR · Duties included</p>
        </div>
      </div>

      <motion.div style={{ y, opacity }} className="container-x pb-6" aria-hidden>
        <Image
          src="/brand/wordmark-white.png"
          alt=""
          width={696}
          height={165}
          sizes="100vw"
          className="h-auto w-full select-none opacity-[0.94]"
        />
      </motion.div>
    </footer>
  );
}
