"use server";

import { commerce } from "@/lib/commerce";
import type { Product } from "@/lib/commerce/types";

export type FormState = { status: "idle" | "ok" | "error"; message: string };

export async function subscribe(_prev: FormState, data: FormData): Promise<FormState> {
  const email = String(data.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  const { ok } = await commerce.subscribeToNewsletter(email);
  return ok
    ? { status: "ok", message: "Thank you. The next letter will find you." }
    : { status: "error", message: "Something went wrong. Please try again." };
}

export async function sendEnquiry(_prev: FormState, data: FormData): Promise<FormState> {
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
    return { status: "error", message: "Please add your name, a valid email and a short message." };
  }
  // Hook up an email/CRM service here (e.g. Resend, Shopify Inbox, HubSpot).
  await new Promise((r) => setTimeout(r, 600));
  return { status: "ok", message: `Thank you, ${name.split(" ")[0]}. We reply within one working day.` };
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return commerce.getProducts({ sortKey: "BEST_SELLING", first: 4 });
  return commerce.getProducts({ query: q, first: 8 });
}
