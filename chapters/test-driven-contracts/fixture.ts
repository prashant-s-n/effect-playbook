import type { Product } from "./product";

type ProductCase = [label: string, product: Partial<typeof Product.Encoded>];

export const products: ProductCase[] = [
  [
    "a simple product",
    {
      id: "c7b1c6eb-a76b-417b-89f9-75fd3cca1dea",
      name: "Trail Mix",
    },
  ],
];
