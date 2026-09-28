/**
 * Storefront API GraphQL documents.
 * Metafields expected in Shopify admin (namespace `custom`):
 *   subtitle (single_line_text), specs (json: {label,value}[]), notes (list.single_line_text),
 *   watch_style (json: WatchStyle), pair_style (json: WatchStyle)
 * Collection metafield: custom.kicker (single_line_text)
 */

const imageFragment = /* GraphQL */ `
  fragment image on Image {
    url
    altText
    width
    height
  }
`;

export const productFragment = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    updatedAt
    options {
      id
      name
      optionValues {
        name
        swatch { color }
      }
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          sku
          availableForSale
          quantityAvailable
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { ...image }
        }
      }
    }
    featuredImage { ...image }
    images(first: 20) { edges { node { ...image } } }
    seo { title description }
    metafields(identifiers: [
      { namespace: "custom", key: "subtitle" }
      { namespace: "custom", key: "specs" }
      { namespace: "custom", key: "notes" }
      { namespace: "custom", key: "watch_style" }
      { namespace: "custom", key: "pair_style" }
    ]) { key value }
  }
  ${imageFragment}
`;

export const collectionFragment = /* GraphQL */ `
  fragment collection on Collection {
    id
    handle
    title
    description
    updatedAt
    image { ...image }
    seo { title description }
    kicker: metafield(namespace: "custom", key: "kicker") { value }
  }
  ${imageFragment}
`;

export const cartFragment = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    totalQuantity
    discountCodes { code applicable }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions { name value }
              image { ...image }
              price { amount currencyCode }
              product { id handle title featuredImage { ...image } }
            }
          }
        }
      }
    }
  }
  ${imageFragment}
`;

export const getProductsQuery = /* GraphQL */ `
  query getProducts($query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $first: Int = 100) {
    products(query: $query, sortKey: $sortKey, reverse: $reverse, first: $first) {
      edges { node { ...product } }
    }
  }
  ${productFragment}
`;

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) { ...product }
  }
  ${productFragment}
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) { ...product }
  }
  ${productFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections {
    collections(first: 50, sortKey: TITLE) { edges { node { ...collection } } }
  }
  ${collectionFragment}
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) { ...collection }
  }
  ${collectionFragment}
`;

export const getCollectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $first: Int = 100) {
    collection(handle: $handle) {
      products(sortKey: $sortKey, reverse: $reverse, first: $first) { edges { node { ...product } } }
    }
  }
  ${productFragment}
`;

export const createCartMutation = /* GraphQL */ `
  mutation createCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) { cart { ...cart } }
  }
  ${cartFragment}
`;

export const getCartQuery = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) { ...cart }
  }
  ${cartFragment}
`;

export const addToCartMutation = /* GraphQL */ `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...cart } }
  }
  ${cartFragment}
`;

export const updateCartMutation = /* GraphQL */ `
  mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...cart } }
  }
  ${cartFragment}
`;

export const removeFromCartMutation = /* GraphQL */ `
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...cart } }
  }
  ${cartFragment}
`;

export const applyDiscountMutation = /* GraphQL */ `
  mutation applyDiscount($cartId: ID!, $codes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $codes) { cart { ...cart } }
  }
  ${cartFragment}
`;

export const customerQuery = /* GraphQL */ `
  query customer($token: String!) {
    customer(customerAccessToken: $token) {
      id firstName lastName email phone acceptsMarketing
      defaultAddress { id firstName lastName address1 address2 city province country zip phone }
      addresses(first: 10) { edges { node { id firstName lastName address1 address2 city province country zip phone } } }
      orders(first: 20, reverse: true) {
        edges { node { id orderNumber processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } } }
      }
    }
  }
`;

export const subscribeMutation = /* GraphQL */ `
  mutation subscribe($email: String!) {
    customerCreate(input: { email: $email, acceptsMarketing: true, password: null }) {
      customerUserErrors { code message }
    }
  }
`;
