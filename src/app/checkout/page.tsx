import type { Metadata } from "next";
import { CheckoutDemo } from "@/components/cart/CheckoutDemo";
import { getCart } from "@/lib/cart/actions";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

/**
 * Stand-in for Shopify Checkout. In production `cart.checkoutUrl` points to
 * Shopify's hosted checkout, so this route is only reached in mock mode.
 */
export default async function CheckoutPage() {
  const cart = await getCart();
  return (
    <div data-theme="light" className="bg-ivory">
      <CheckoutDemo cart={cart} />
    </div>
  );
}
