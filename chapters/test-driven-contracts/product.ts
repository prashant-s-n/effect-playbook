import { Schema } from "effect";

/**
 * Runtime contract for a product payload at version `1.0.0`.
 *
 * This schema defines the minimum product shape the application accepts at the
 * boundary. It is used to validate partial encoded product data and turn it
 * into a fully decoded `Product` value.
 */
export const Product = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
});

/**
 * Decodes partial product input into a validated `Product`.
 *
 * Use this in tests or other boundary code when you want to check whether a
 * product-shaped payload satisfies the `Product` contract. The function throws
 * if the provided value is missing required fields or contains invalid data.
 */
export const fromUnknown = (
  product: Partial<typeof Product.Encoded>
): typeof Product.Type => Schema.decodeUnknownSync(Product)(product);
