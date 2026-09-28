import type { WatchStyle } from "@/lib/watch/spec";

/**
 * Commerce domain types.
 *
 * These mirror the shape of the Shopify Storefront API (after normalisation:
 * connections flattened to arrays, metafields lifted to named fields) so the
 * UI never has to change when the mock provider is swapped for Shopify.
 * Components import from here — never from a provider.
 */

export type Money = {
  /** Decimal string, as Shopify returns it: "58000.0" */
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type SEO = {
  title: string;
  description: string;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductOptionValue = {
  name: string;
  /** Optional swatch colour (Shopify: optionValues.swatch.color) */
  swatch?: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: ProductOptionValue[];
};

export type ProductVariant = {
  id: string;
  title: string;
  sku: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type Gender = "women" | "men" | "unisex";

export type Product = {
  id: string;
  handle: string;
  title: string;
  /** Short line under the title. Shopify: metafield custom.subtitle */
  subtitle: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  /** Derived from tags (gender:women / gender:men) */
  gender: Gender;
  availableForSale: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
  featuredImage: Image;
  images: Image[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  /** Technical specifications. Shopify: metafield custom.specs (list.json) */
  specs: ProductSpec[];
  /** Short editorial notes shown on the product page. Shopify: metafield custom.notes */
  notes: string[];
  /** Dial layout for the 3D viewer. Shopify: metafield custom.watch_style (json) */
  watchStyle: WatchStyle | null;
  /** Second watch in a paired set. Shopify: metafield custom.pair_style (json) */
  pairStyle: WatchStyle | null;
  seo: SEO;
  updatedAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  /** Short line used in navigation and headers */
  kicker: string;
  description: string;
  image: Image | null;
  seo: SEO;
  path: string;
  updatedAt: string;
};

export type ProductSortKey = "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE";

export type ProductQuery = {
  query?: string;
  sortKey?: ProductSortKey;
  reverse?: boolean;
  first?: number;
};

export type CollectionProductsQuery = ProductQuery & {
  handle: string;
};

/* ---------------------------------- Cart --------------------------------- */

export type CartItem = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    image: Image | null;
    price: Money;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: Image;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartItem[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  discountCodes: { code: string; applicable: boolean }[];
};

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
};

export type CartLineUpdateInput = {
  id: string;
  merchandiseId: string;
  quantity: number;
};

/* -------------------------------- Customer ------------------------------- */

export type Address = {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string | null;
  country: string;
  zip: string;
  phone: string | null;
};

export type OrderSummary = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: Money;
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  acceptsMarketing: boolean;
  defaultAddress: Address | null;
  addresses: Address[];
  orders: OrderSummary[];
};
