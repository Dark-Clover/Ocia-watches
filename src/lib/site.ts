/**
 * Site-wide copy and contact details. Placeholder contact values —
 * replace before launch (the brand book asks to confirm domain and handles).
 */
export const site = {
  name: "OCIA",
  tagline: "Lifestyle Essentials",
  line: "Considered details. Everyday presence.",
  description:
    "OCIA makes quiet, precise watches for women and men. Designed in Islamabad for everyday life.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@ocia.pk",
  phone: "+92 51 000 0000",
  whatsapp: "+92 300 000 0000",
  studio: {
    name: "The OCIA Studio",
    lines: ["By appointment", "Islamabad, Pakistan"],
    hours: "Tuesday – Saturday, 11:00 – 19:00",
  },
  /** Where the brand is based */
  origin: {
    place: "Islamabad",
    coordinates: "33.6844° N, 73.0479° E",
  },
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Pinterest", href: "https://pinterest.com/" },
    { label: "TikTok", href: "https://tiktok.com/" },
  ],
  values: [
    { word: "Quiet", line: "Nothing on the dial that does not need to be there." },
    { word: "Precise", line: "Sapphire, 316L steel and movements chosen for how they keep time." },
    { word: "Confident", line: "Proportions that hold their own without asking for attention." },
    { word: "Timeless", line: "Designed to be worn for decades, not for a season." },
  ],
} as const;

export const nav = {
  primary: [
    { label: "For her", href: "/collections/women" },
    { label: "For him", href: "/collections/men" },
    { label: "All watches", href: "/collections/all" },
    { label: "Pairs & gifts", href: "/collections/pairs" },
    { label: "The house", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footer: [
    {
      title: "Shop",
      links: [
        { label: "For her", href: "/collections/women" },
        { label: "For him", href: "/collections/men" },
        { label: "All watches", href: "/collections/all" },
        { label: "Pairs & gifts", href: "/collections/pairs" },
      ],
    },
    {
      title: "House",
      links: [
        { label: "Our story", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Private viewing", href: "/contact?topic=viewing" },
        { label: "Account", href: "/account" },
      ],
    },
    {
      title: "Care",
      links: [
        { label: "Delivery & returns", href: "/info/delivery" },
        { label: "Warranty", href: "/info/warranty" },
        { label: "Watch care", href: "/info/care" },
        { label: "Privacy", href: "/info/privacy" },
      ],
    },
  ],
} as const;
