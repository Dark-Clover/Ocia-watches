# OCIA — storefront

Custom Next.js 16 storefront for OCIA (Lifestyle Essentials). Built to run on mock data now and on Shopify's Storefront API later, without touching the UI.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Architecture

```
src/
  app/                      routes: home, collections/[handle], products/[handle],
                            about, contact, account, info/[slug], checkout (mock only)
    renders/…/route.ts      serves mock product imagery as real image URLs
  components/
    home/                   hero (3D), values, manifesto, gender split, rail, anatomy (3D), details, origin
    product/                ProductCard, ProductView (variants), ProductGallery (lightbox + 3D), CollectionView
    cart/                   CartProvider (optimistic), CartDrawer, CheckoutDemo
    layout/                 Header, MenuOverlay, SearchOverlay, Footer, Preloader
    three/                  procedural WatchModel + Hero/Anatomy/Viewer canvases
    ui/                     motion primitives, buttons, icons, cursor, marquee…
  lib/
    commerce/
      types.ts              Product, ProductVariant, Collection, Cart, CartItem, Customer…
      provider.ts           CommerceProvider — the only contract the UI depends on
      index.ts              picks the provider from COMMERCE_PROVIDER
      mock/                 catalogue + cookie-persisted cart
      shopify/              Storefront API client, GraphQL, normalisers
    cart/actions.ts         provider-agnostic cart server actions
    watch/                  watch spec + SVG renderer (product imagery, 3D dial textures)
    site.ts                 contact details, nav, brand values — edit here
```

Components only import `@/lib/commerce/types`. Server components call `commerce.*`; client components get data as props or through server actions.

## Connecting Shopify

1. Copy `.env.example` to `.env.local`, set `COMMERCE_PROVIDER=shopify`, the store domain and a Storefront API token.
2. In Shopify admin, create products with options named **Case**, **Dial**, **Size**, **Strap** (values like `Steel`, `Ink`, `40 mm`, `Ink leather`). Add swatch colours to option values.
3. Add metafields (namespace `custom`): `subtitle`, `specs` (JSON `{label,value}[]`), `notes` (list), `watch_style` (JSON, see `lib/watch/spec.ts`; enables the 3D viewer), and `kicker` on collections.
4. Tag products `gender:women` / `gender:men`. Include option values in image alt text (e.g. "Steel case, Ink dial") so the gallery can filter by variant.
5. Collections with handles `all`, `women`, `men`, `pairs` feed the navigation.

Checkout goes to Shopify's hosted `checkoutUrl`. `/checkout` only exists for mock mode.

## Placeholders to replace before launch

- Contact details in `src/lib/site.ts` (email, phone, studio address, social links)
- Product names, prices (PKR) and specs in `src/lib/commerce/mock/catalog.ts` are illustrative
- Rendered watch imagery stands in for photography; real photos arrive through Shopify
