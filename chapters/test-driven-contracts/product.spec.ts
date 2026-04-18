import { describe, expect, test } from "bun:test";
import { from, hasPricing, hasShipping } from ".";
import { products } from "./fixture";

describe("Product", () => {
  describe("from", () => {
    test.each(products)("should decode $label", ({ payload }) => {
      const product = from(payload);

      expect(hasPricing(product)).toBe(true);
      expect(hasShipping(product)).toBe(true);
    });
  });
});
