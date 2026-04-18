# Test-Driven Contracts

This chapter shows how to treat an Effect `Schema` as a runtime contract for
data entering your system, and how to evolve that contract without silently
breaking older payloads.

The current example models a `Product` with pricing and optional shipping:

```ts
export const Product = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
  price: Price,
  shipping: Schema.optional(Shipping),
});
```

That schema gives us two useful things at once:

- a runtime validator for external data
- a strongly typed domain value after decoding

To keep the boundary explicit, the chapter exposes a small decoder:

```ts
export const from = (product: Partial<typeof Product.Encoded>) =>
  Schema.decodeUnknownSync(Product)(product);
```

Use `from` in tests or other edge-facing code whenever you want to ask a
simple question:

> Does this product-shaped payload satisfy the contract?

If the payload is valid, decoding returns a typed `Product`. If the payload is
invalid, decoding throws.

## Evolving The Contract

As the `Product` model grows, contract tests give us a safe way to keep older
payloads working while we add new domain requirements.

### Required Price With A Default

When `price` becomes required, older payloads would normally fail to decode. In
this chapter, we keep the field required in the domain while providing a decode
default for missing data:

```ts
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
```

That lets the domain ask a meaningful question without duplicating validation
logic:

```ts
export const hasPrice = (product: typeof Product.Type): boolean =>
  Predicate.isNotUndefined(product.price) &&
  BigDecimal.greaterThanOrEqualTo(
    product.price.amount,
    BigDecimal.unsafeFromNumber(0)
  );
```

### Optional Shipping

The same chapter also evolves `Product` with optional shipping details. If
shipping is missing, the decoder still accepts the payload and the domain
helper treats the absence as valid for products that do not need shipping:

```ts
import { Predicate, Schema } from "effect";

export const Shipping = Schema.Struct({
  method: Schema.Literal("standard", "express"),
  etaDays: Schema.Number,
});

export const Product = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
  price: Price,
  shipping: Schema.optional(Shipping),
});
```

The domain utility answers a business question rather than exposing the schema
shape directly:

```ts
export const hasShipping = (product: typeof Product.Type): boolean => {
  if (!product.shipping) {
    return true;
  }

  return (
    Predicate.isNotUndefined(product.shipping.method) &&
    Predicate.isNotUndefined(product.shipping.etaDays)
  );
};
```

### Contract Tests

Instead of relying on broader transaction tests, this chapter keeps small
fixture-driven contract tests around schema evolution:

```ts
describe("Product", () => {
  describe("from", () => {
    test.each(products)("should decode $label", ({ payload }) => {
      const product = from(payload);

      expect(hasPrice(product)).toBe(true);
      expect(hasShipping(product)).toBe(true);
    });
  });
});
```

This keeps the compatibility story explicit:

- older payloads still decode
- new fields can be introduced safely
- domain utilities capture the business rules around evolved contracts
