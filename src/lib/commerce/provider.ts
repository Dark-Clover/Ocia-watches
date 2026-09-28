import type {
  Cart,
  CartLineInput,
  CartLineUpdateInput,
  Collection,
  CollectionProductsQuery,
  Customer,
  Product,
  ProductQuery,
} from "./types";

/**
 * The single contract between the storefront UI and a commerce backend.
 *
 * `mock`    — local catalogue + cookie-persisted cart (development, design review)
 * `shopify` — Shopify Storefront API (production)
 *
 * Swapping backends means implementing this interface. Nothing in
 * `src/components` or `src/app` should need to change.
 */
export interface CommerceProvider {
  readonly name: string;

  // Catalogue
  getProducts(query?: ProductQuery): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | undefined>;
  getProductRecommendations(productId: string): Promise<Product[]>;
  getCollections(): Promise<Collection[]>;
  getCollection(handle: string): Promise<Collection | undefined>;
  getCollectionProducts(query: CollectionProductsQuery): Promise<Product[]>;

  // Cart — Shopify's cart is the source of truth once connected
  createCart(): Promise<Cart>;
  getCart(cartId: string): Promise<Cart | undefined>;
  addToCart(cartId: string, lines: CartLineInput[]): Promise<Cart>;
  updateCart(cartId: string, lines: CartLineUpdateInput[]): Promise<Cart>;
  removeFromCart(cartId: string, lineIds: string[]): Promise<Cart>;
  applyDiscountCodes(cartId: string, codes: string[]): Promise<Cart>;

  // Customer — Shopify Customer Account API once connected
  getCustomer(accessToken: string): Promise<Customer | undefined>;

  // Marketing
  subscribeToNewsletter(email: string): Promise<{ ok: boolean }>;
}
