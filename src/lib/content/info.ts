/** Service pages. With Shopify these can move to Shopify Pages / Policies. */
export const INFO: Record<string, { title: string; kicker: string; sections: { heading: string; body: string }[] }> = {
  delivery: {
    title: "Delivery & returns",
    kicker: "Care",
    sections: [
      { heading: "Within Pakistan", body: "Insured express delivery in 48 hours to major cities, and within four working days elsewhere. Complimentary on orders above PKR 50,000." },
      { heading: "International", body: "Fully insured delivery in 3–6 working days. Duties and taxes are shown at checkout, so there is nothing to pay on arrival." },
      { heading: "Returns", body: "Return any unworn watch within 14 days, in its original packaging, for a full refund. Engraved pieces are final sale." },
    ],
  },
  warranty: {
    title: "Warranty",
    kicker: "Care",
    sections: [
      { heading: "Two years, worldwide", body: "Every OCIA watch carries a two-year international warranty covering the movement and any manufacturing defect." },
      { heading: "What is not covered", body: "Wear to straps, damage from impact or water beyond the stated resistance, and work by unauthorised watchmakers." },
      { heading: "Making a claim", body: "Write to us with your order number. We arrange insured collection and return the watch within three weeks." },
    ],
  },
  care: {
    title: "Watch care",
    kicker: "Care",
    sections: [
      { heading: "Everyday", body: "Wipe the case and crystal with a soft dry cloth. Keep leather away from water and perfume; suede prefers a soft brush." },
      { heading: "Water", body: "Check the rating on your caseback. Never operate the crown or pushers under water." },
      { heading: "Servicing", body: "Automatic movements benefit from a service every four to five years. Quartz batteries last around three years; we replace them for free during the warranty." },
    ],
  },
  privacy: {
    title: "Privacy",
    kicker: "Legal",
    sections: [
      { heading: "What we collect", body: "The details you give us when you order, write to us or join the letter — and nothing more than we need." },
      { heading: "How we use it", body: "To fulfil orders, answer you, and, if you ask us to, send occasional news. We never sell your data." },
      { heading: "Your choices", body: "Unsubscribe at any time from any letter, or write to us to see or delete what we hold." },
    ],
  },
};
