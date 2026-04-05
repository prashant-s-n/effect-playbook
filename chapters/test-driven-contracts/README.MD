# Test-Driven Contracts

This chapter shows how to treat an Effect `Schema` as a runtime contract for
data entering your system, and how to evolve that contract without silently
breaking older payloads.

The current example models a minimal `Product`:

```ts
export const Product = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
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

### Optional Media With Fallback Assets

The same chapter also evolves `Product` with optional media assets. If media is
missing, decoding falls back to generic image and video files:

```ts
import { Predicate, Schema } from "effect";

export const DefaultMediaAssets = {
  images: [new URL("https://picsum.photos/id/237/200/300")],
  videos: [new URL("https://samplelib.com/mp4/sample-5s.mp4")],
};

export const MediaAssets = Schema.Struct({
  images: Schema.Array(Schema.URL),
  videos: Schema.Array(Schema.URL),
});

export const Product = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
  price: Price,
  mediaAssets: MediaAssets.pipe(
    Schema.optional,
    Schema.withDefaults({
      constructor: () => DefaultMediaAssets,
      decoding: () => DefaultMediaAssets,
    })
  ),
});
```

The domain utility answers a business question rather than exposing the schema
shape directly:

```ts
export const hasMediaAssets = (product: typeof Product.Type): boolean =>
  Predicate.isNotUndefined(product.mediaAssets) &&
  (product.mediaAssets.images.length > 0 ||
    product.mediaAssets.videos.length > 0);
```

### Contract Tests

Instead of relying on broader transaction tests, this chapter keeps small
fixture-driven contract tests around schema evolution:

```ts
describe("Product", () => {
  describe("decode", () => {
    test.each(products)("should decode $label", ({ payload }) => {
      const product = from(payload);

      expect(product.id).toBe(payload.id);
      expect(product.name).toBe(payload.name);
      expect(hasPrice(product)).toBe(true);
      expect(hasMediaAssets(product)).toBe(true);
    });
  });
});
```

This keeps the compatibility story explicit:

- older payloads still decode
- new fields can be introduced safely
- domain utilities capture the business rules around evolved contracts
