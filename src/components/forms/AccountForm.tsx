"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Passwordless sign-in UI. With Shopify, this hands off to the Customer
 * Account API's one-time-code flow; in mock mode it only simulates the step.
 */
export function AccountForm() {
  const [sent, setSent] = useState<string | null>(null);
  if (sent) {
    return (
      <div className="border-t border-ink/15 pt-8">
        <p className="serif text-3xl">Check your inbox.</p>
        <p className="mt-4 text-sm leading-relaxed text-stone">
          We sent a six-digit code to {sent}. (Demo: customer accounts connect when Shopify is enabled.)
        </p>
        <button onClick={() => setSent(null)} className="eyebrow link-draw mt-8 text-[0.625rem]">Use another email</button>
      </div>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(String(new FormData(e.currentTarget).get("email")));
      }}
      className="border-t border-ink/15 pt-8"
    >
      <label htmlFor="account-email" className="eyebrow text-[0.5625rem] text-stone">Email</label>
      <input id="account-email" name="email" type="email" required className="mt-3 w-full border-b border-ink/20 bg-transparent pb-3 text-base focus:border-ink focus:outline-none" />
      <Button type="submit" arrow className="mt-10 w-full">Send sign-in code</Button>
      <p className="mt-4 text-xs text-stone">No password needed. New here? An account is created on your first order.</p>
    </form>
  );
}
