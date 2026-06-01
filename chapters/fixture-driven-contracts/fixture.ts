import type { Product } from "./product";

interface ProductCase {
  label: string;
  payload: Partial<typeof Product.Encoded>;
  expectsRealPrice?: boolean;
}

export const products: ProductCase[] = [
  {
    label: "legacy product",
    payload: {
      id: "c7b1c6eb-a76b-417b-89f9-75fd3cca1dea",
      name: "Trail Mix",
    },
  },
  {
    label: "priced product",
    expectsRealPrice: true,
    payload: {
      id: "f357d8d4-2ca0-48cb-ae35-12dd51f2b8d2",
      name: "Coffee Beans",
      price: {
        amount: "12",
        currency: "usd",
      },
    },
  },
  {
    label: "priced product with shipping",
    expectsRealPrice: true,
    payload: {
      id: "8c80a457-59c8-4a50-876a-62c1633a0ee0",
      name: "Tea Sampler",
      price: {
        amount: "18",
        currency: "usd",
      },
      shipping: {
        method: "express",
        etaDays: 2,
      },
    },
  },
];
