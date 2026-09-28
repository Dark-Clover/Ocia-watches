import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section data-theme="dark" className="flex min-h-[100svh] flex-col items-center justify-center bg-ink px-6 text-center text-ivory">
      <p className="eyebrow text-mist">404</p>
      <h1 className="display mt-8 text-[clamp(3.5rem,10vw,10rem)]">Out of time.</h1>
      <p className="mt-6 max-w-sm text-sm text-mist">This page has stopped. The rest of the collection keeps running.</p>
      <ButtonLink href="/" variant="ghost" className="mt-12">Return home</ButtonLink>
    </section>
  );
}
