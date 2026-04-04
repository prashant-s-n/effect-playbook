import { describe, expect, test } from "bun:test";
import { fromUnknown } from ".";
import { products } from "./fixture";

describe("Product", () => {
  describe("decode", () => {
    test.each(
      products
    )("should decode a valid product contract for %s", (_label, product) => {
      expect(() => fromUnknown(product)).not.toThrow();
    });
  });
});
