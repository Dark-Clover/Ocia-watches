"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "./icons";
import { TLink } from "./TLink";

type Variant = "solid" | "outline" | "light" | "ghost";

const styles: Record<Variant, { root: string; fill: string; text: string }> = {
  solid: { root: "bg-ink text-ivory", fill: "bg-ivory", text: "group-hover:text-ink" },
  light: { root: "bg-ivory text-ink", fill: "bg-ink", text: "group-hover:text-ivory" },
  outline: { root: "border border-current/25 text-current", fill: "bg-ink", text: "group-hover:text-ivory" },
  ghost: { root: "border border-ivory/30 text-ivory", fill: "bg-ivory", text: "group-hover:text-ink" },
};

function Inner({ children, variant, arrow }: { children: ReactNode; variant: Variant; arrow?: boolean }) {
  const s = styles[variant];
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-y-100 group-disabled:scale-y-0",
          s.fill,
        )}
      />
      <span className={cn("relative z-10 flex items-center gap-4 transition-colors duration-500", s.text)}>
        {/* The label slides up and a copy slides in — a quiet, mechanical motion */}
        <span className="relative block overflow-hidden">
          <span className="block transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-full group-disabled:translate-y-0">
            {children}
          </span>
          <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-disabled:translate-y-full">
            {children}
          </span>
        </span>
        {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />}
      </span>
    </>
  );
}

const rootClass = "group relative inline-flex h-14 items-center justify-center overflow-hidden px-8 eyebrow disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  variant = "solid",
  arrow,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; arrow?: boolean }) {
  return (
    <button className={cn(rootClass, styles[variant].root, className)} {...rest}>
      <Inner variant={variant} arrow={arrow}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "solid",
  arrow = true,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <TLink href={href} className={cn(rootClass, styles[variant].root, className)}>
      <Inner variant={variant} arrow={arrow}>
        {children}
      </Inner>
    </TLink>
  );
}

/** Text link with drawn underline and arrow. */
export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <TLink href={href} className={cn("group inline-flex items-center gap-3 eyebrow", className)}>
      <span className="link-draw pb-1">{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5" />
    </TLink>
  );
}
