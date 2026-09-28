import type { Metadata } from "next";
import { AccountForm } from "@/components/forms/AccountForm";
import { SplitReveal } from "@/components/ui/motion";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div data-theme="light" className="bg-ivory">
      <section className="container-x grid gap-16 pb-32 pt-40 md:pb-48 md:pt-52 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow text-stone">Account</p>
          <SplitReveal as="h1" text={"Welcome\nback."} className="display mt-8 text-[clamp(3.5rem,9vw,9rem)]" />
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-stone">
            Sign in with your email to see orders, track deliveries, register your warranty and manage the letter.
          </p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8 lg:pt-32">
          <AccountForm />
        </div>
      </section>
    </div>
  );
}
