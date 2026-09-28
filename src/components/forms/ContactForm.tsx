"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { EASE_OUT } from "@/components/ui/motion";
import { sendEnquiry, type FormState } from "@/lib/actions/site";
import { cn } from "@/lib/utils";

const TOPICS = [
  { value: "advice", label: "Choosing a watch" },
  { value: "viewing", label: "Private viewing" },
  { value: "order", label: "An existing order" },
  { value: "service", label: "Service & warranty" },
  { value: "press", label: "Press & partnerships" },
];

function Field({ label, name, type = "text", textarea, required = true }: { label: string; name: string; type?: string; textarea?: boolean; required?: boolean }) {
  const cls =
    "peer w-full border-b border-ink/20 bg-transparent pb-3 pt-7 text-base placeholder-transparent transition-colors focus:border-ink focus:outline-none";
  return (
    <div className="relative">
      {textarea ? (
        <textarea id={name} name={name} required={required} rows={4} placeholder={label} className={cn(cls, "resize-none")} />
      ) : (
        <input id={name} name={name} type={type} required={required} placeholder={label} className={cls} />
      )}
      <label
        htmlFor={name}
        className="eyebrow pointer-events-none absolute left-0 top-1 text-[0.5625rem] text-stone transition-all duration-300 peer-placeholder-shown:top-7 peer-placeholder-shown:text-xs peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-1 peer-focus:text-[0.5625rem] peer-focus:uppercase peer-focus:tracking-[0.32em]"
      >
        {label}
      </label>
    </div>
  );
}

export function ContactForm({ topic }: { topic?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendEnquiry, { status: "idle", message: "" });

  return (
    <AnimatePresence mode="wait">
      {state.status === "ok" ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_OUT }}
          className="flex min-h-[420px] flex-col justify-center"
        >
          <svg viewBox="0 0 60 60" className="h-14 w-14" aria-hidden>
            <motion.circle cx="30" cy="30" r="29" fill="none" stroke="currentColor" strokeWidth="0.75" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: EASE_OUT }} />
            <motion.path d="M19 31l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="0.9" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.8, ease: EASE_OUT }} />
          </svg>
          <p className="serif mt-8 text-4xl">{state.message}</p>
        </motion.div>
      ) : (
        <motion.form key="form" action={action} exit={{ opacity: 0, y: -20 }} className="space-y-6">
          <fieldset>
            <legend className="eyebrow text-[0.5625rem] text-stone">I&apos;m writing about</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <label key={t.value} className="cursor-pointer">
                  <input type="radio" name="topic" value={t.value} defaultChecked={(topic ?? "advice") === t.value} className="peer sr-only" />
                  <span className="block border border-ink/15 px-4 py-2.5 text-xs transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-1">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Your name" name="name" />
            <Field label="Email" name="email" type="email" />
          </div>
          <Field label="Phone (optional)" name="phone" type="tel" required={false} />
          <Field label="How can we help?" name="message" textarea />
          <div className="flex flex-wrap items-center gap-6 pt-4">
            <Button type="submit" arrow disabled={pending}>
              {pending ? "Sending" : "Send message"}
            </Button>
            <p aria-live="polite" className="text-xs text-stone">
              {state.status === "error" ? state.message : "We reply within one working day."}
            </p>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
