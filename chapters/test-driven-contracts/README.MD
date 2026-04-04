# Test-Driven Contracts

This chapter shows how to treat an Effect `Schema` as a runtime contract for
data entering your system.

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
export const fromUnknown = (product: Partial<typeof Product.Encoded>) =>
  Schema.decodeUnknownSync(Product)(product);
```

Use `fromUnknown` in tests or other edge-facing code whenever you want to ask a
simple question:

> Does this product-shaped payload satisfy the contract?

If the payload is valid, decoding returns a typed `Product`. If the payload is
invalid, decoding throws.

## Why this is useful

Writing tests against the contract helps us evolve the schema safely. As the
`Product` model grows, the tests can describe the behavior we want first, and
the schema becomes the executable definition of that contract.
