import { describe, expect, test } from "bun:test";
import { from } from ".";
import { products } from "./fixture";
import { hasMediaAssets, hasPrice } from "./product";

describe("Product", () => {
  describe("decode", () => {
    test.each(products)("should decode $label", ({ payload }) => {
      const product = from(payload);

      expect(hasPrice(product)).toBe(true);
      expect(hasMediaAssets(product)).toBe(true);
      expect(product.mediaAssets).toBeDefined();
    });
  });
});
