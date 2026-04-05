import type { Product } from "./product";

interface ProductCase {
  label: string;
  payload: Partial<typeof Product.Encoded>;
}

export const products: ProductCase[] = [
  {
    label: "a simple product",
    payload: {
      id: "c7b1c6eb-a76b-417b-89f9-75fd3cca1dea",
      name: "Trail Mix",
    },
  },
  {
    label: "a simple product with a pricing",
    payload: {
      id: "c7b1c6eb-a76b-417b-89f9-75fd3cca1dea",
      name: "Trail Mix",
      price: {
        amount: "12",
        currency: "usd",
      },
      shipping: {
        method: "express",
        etaDays: 2,
      },
    },
  },
];
