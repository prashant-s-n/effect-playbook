import { BigDecimal, Predicate, Schema } from "effect";

export const DefaultPrice = {
  currency: "usd" as const,
  amount: BigDecimal.unsafeFromNumber(0),
};

export const Price = Schema.Struct({
  currency: Schema.Literal("usd", "cad", "inr"),
  amount: Schema.BigDecimal,
}).pipe(
  Schema.optional,
  Schema.withDefaults({
    constructor: () => DefaultPrice,
    decoding: () => DefaultPrice,
  })
);

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
  price: Price,
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

/**
 * Returns `true` when a product has a usable price for domain logic.
 *
 * This predicate treats a price as valid only when the `price` field is
 * present and its amount is zero or greater. It gives the rest of the domain a
 * small, intention-revealing API for asking whether pricing data is available
 * without repeating `BigDecimal` checks at every call site.
 */
export const hasPrice = (product: typeof Product.Type): boolean =>
  Predicate.isNotUndefined(product.price) &&
  BigDecimal.greaterThanOrEqualTo(
    product.price.amount,
    BigDecimal.unsafeFromNumber(0)
  );
