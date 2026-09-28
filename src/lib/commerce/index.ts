import "server-only";
import { mockProvider } from "./mock/provider";
import type { CommerceProvider } from "./provider";
import { shopifyProvider } from "./shopify/provider";

/**
 * The active commerce backend. Server code imports `commerce` from here;
 * client components receive data as props or through server actions.
 */
export const commerce: CommerceProvider =
  process.env.COMMERCE_PROVIDER === "shopify" ? shopifyProvider : mockProvider;

export type * from "./types";
