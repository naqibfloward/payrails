export type Country = "United Kingdom" | "Jordan";
export type Operation = "subscription" | "checkout";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 3 | 6 | 12;
  description: string;
  features: string[];
}

export interface Product {
  id: string;
  name: string;
  price: Record<Country, number>;
  currency: Record<Country, string>;
  emoji: string;
  description: string;
}

export interface ProductSelection {
  productId: string;
  quantity: number;
}

export interface Voucher {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed" | "shipping";
  description: string;
  minOrder: number;
}

export const SUBSCRIPTIONS_BY_COUNTRY: Record<Country, Subscription[]> = {
  "United Kingdom": [
    {
      id: "sub-gbp-1",
      name: "Bloom",
      price: 14.0,
      currency: "GBP",
      period: 3,
      description: "A fresh seasonal arrangement every month",
      features: [
        "Monthly fresh arrangement",
        "Seasonal flower selection",
        "Free delivery",
        "Gift card included",
      ],
    },
    {
      id: "sub-gbp-2",
      name: "Garden",
      price: 29.0,
      currency: "GBP",
      period: 6,
      description: "Weekly premium bouquets for your home",
      features: [
        "Weekly fresh bouquets",
        "Premium flower varieties",
        "Priority delivery",
        "Complimentary vase",
        "Florist consultation",
      ],
    },
    {
      id: "sub-gbp-3",
      name: "Bloom Annual",
      price: 140.0,
      currency: "GBP",
      period: 12,
      description: "Seasonal arrangements all year save 17%",
      features: [
        "Monthly fresh arrangement",
        "Seasonal flower selection",
        "Free delivery",
        "Gift card included",
        "2 bonus arrangements",
      ],
    },
    {
      id: "sub-gbp-4",
      name: "Garden Annual",
      price: 290.0,
      currency: "GBP",
      period: 12,
      description: "Weekly premium bouquets all year save 17%",
      features: [
        "Weekly fresh bouquets",
        "Premium flower varieties",
        "Priority delivery",
        "Complimentary vase",
        "Florist consultation",
        "Exclusive seasonal specials",
      ],
    },
  ],
  Jordan: [
    {
      id: "sub-jod-1",
      name: "Bloom",
      price: 6.0,
      currency: "JOD",
      period: 3,
      description: "A fresh seasonal arrangement every month",
      features: [
        "Monthly fresh arrangement",
        "Seasonal flower selection",
        "Free delivery",
        "Gift card included",
      ],
    },
    {
      id: "sub-jod-2",
      name: "Garden",
      price: 12.0,
      currency: "JOD",
      period: 6,
      description: "Weekly premium bouquets for your home",
      features: [
        "Weekly fresh bouquets",
        "Premium flower varieties",
        "Priority delivery",
        "Complimentary vase",
        "Florist consultation",
      ],
    },
    {
      id: "sub-jod-3",
      name: "Bloom Annual",
      price: 60.0,
      currency: "JOD",
      period: 12,
      description: "Seasonal arrangements all year save 17%",
      features: [
        "Monthly fresh arrangement",
        "Seasonal flower selection",
        "Free delivery",
        "Gift card included",
        "2 bonus arrangements",
      ],
    },
    {
      id: "sub-jod-4",
      name: "Garden Annual",
      price: 120.0,
      currency: "JOD",
      period: 12,
      description: "Weekly premium bouquets all year save 17%",
      features: [
        "Weekly fresh bouquets",
        "Premium flower varieties",
        "Priority delivery",
        "Complimentary vase",
        "Florist consultation",
        "Exclusive seasonal specials",
      ],
    },
  ],
};

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Classic Rose Bouquet",
    price: { "United Kingdom": 29.99, Jordan: 12.99 },
    currency: { "United Kingdom": "GBP", Jordan: "JOD" },
    emoji: "🌹",
    description: "Dozen premium red roses, hand-arranged",
  },
  {
    id: "prod-2",
    name: "Sunflower Arrangement",
    price: { "United Kingdom": 24.0, Jordan: 10.0 },
    currency: { "United Kingdom": "GBP", Jordan: "JOD" },
    emoji: "🌻",
    description: "Bright sunflowers in a rustic wrap",
  },
  {
    id: "prod-3",
    name: "Tulip Bundle",
    price: { "United Kingdom": 19.99, Jordan: 8.99 },
    currency: { "United Kingdom": "GBP", Jordan: "JOD" },
    emoji: "🌷",
    description: "Mixed tulips in spring colours",
  },
  {
    id: "prod-4",
    name: "Orchid Plant",
    price: { "United Kingdom": 36.0, Jordan: 14.0 },
    currency: { "United Kingdom": "GBP", Jordan: "JOD" },
    emoji: "🪴",
    description: "Potted blooming orchid, ready to gift",
  },
  {
    id: "prod-5",
    name: "Wildflower Bouquet",
    price: { "United Kingdom": 22.99, Jordan: 9.99 },
    currency: { "United Kingdom": "GBP", Jordan: "JOD" },
    emoji: "💐",
    description: "Hand-picked seasonal wildflowers",
  },
  {
    id: "prod-6",
    name: "Lavender Bundle",
    price: { "United Kingdom": 16.99, Jordan: 6.99 },
    currency: { "United Kingdom": "GBP", Jordan: "JOD" },
    emoji: "🌿",
    description: "Dried lavender stems, long-lasting fragrance",
  },
];

export const VOUCHERS: Voucher[] = [
  {
    id: "v1",
    code: "WELCOME10",
    discount: 10,
    type: "percentage",
    description: "10% off your first order",
    minOrder: 20,
  },
  {
    id: "v2",
    code: "FLAT5OFF",
    discount: 5,
    type: "fixed",
    description: "5 off orders over 30",
    minOrder: 30,
  },
  {
    id: "v3",
    code: "SUMMER20",
    discount: 20,
    type: "percentage",
    description: "20% summer special discount",
    minOrder: 50,
  },
];

export const PAYMENT_METHODS = [
  { id: "credit_card", label: "Credit Card", logo: null },
  {
    id: "apple_pay",
    label: "Apple Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg",
  },
  {
    id: "google_pay",
    label: "Google Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
  },
];
