import type { Money } from "@/lib/commerce/types";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const formatters = new Map<string, Intl.NumberFormat>();

/** "PKR 58,000" — luxury pricing never shows decimals for whole amounts. */
export function formatMoney({ amount, currencyCode }: Money) {
  let fmt = formatters.get(currencyCode);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    });
    formatters.set(currencyCode, fmt);
  }
  return fmt.format(Number(amount)).replace(/ /g, " ");
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
