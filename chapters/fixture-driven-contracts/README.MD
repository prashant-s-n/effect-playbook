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
export const hasValidPricingDetails = (product: typeof Product.Type): boolean =>
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
export const hasValidShippingDetails = (
  product: typeof Product.Type
): boolean => {
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

Then we extend the fixtures so both old and new payloads are verified against
the same boundary:

```ts
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
```

Instead of relying on broader transaction tests, this chapter keeps small
fixture-driven contract tests around schema evolution:

```ts
describe("Product", () => {
  describe("from", () => {
    test.each(products)("decodes $label", ({ payload, expectsRealPrice }) => {
      const product = from(payload);

      expect(product.price).toBeDefined();
      expect(hasValidShippingDetails(product)).toBe(true);

      if (expectsRealPrice) {
        expect(hasValidPricingDetails(product)).toBe(true);
      }
    });
  });
});
```

This keeps the compatibility story explicit:

- older payloads still decode
- new fields can be introduced safely
- domain utilities capture the business rules around evolved contracts

## What This Does Not Solve

This pattern is very good at keeping supported shapes explicit, but it does not
magically protect you from every contract change. If `price` becomes
`listPrice`, the old fixture set only keeps working if you deliberately support
both shapes at the boundary.

The same is true for semantic changes. Fixtures help you encode the cases you
care about, but they only guard the rules you chose to make explicit.
