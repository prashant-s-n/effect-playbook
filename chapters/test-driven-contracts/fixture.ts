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
    },
  },
  {
    label: "a product with media assets",
    payload: {
      id: "4e4ed9d8-cd46-4a66-aaf5-bfcf0fb9d64f",
      name: "Camp Mug",
      mediaAssets: {
        images: [
          "https://picsum.photos/id/237/200/300",
          "https://picsum.photos/seed/camp-mug/400/300",
        ],
        videos: [
          "https://samplelib.com/mp4/sample-5s.mp4",
          "https://samplelib.com/mp4/sample-10s.mp4",
        ],
      },
    },
  },
];
