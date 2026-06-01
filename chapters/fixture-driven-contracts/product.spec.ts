import { describe, expect, test } from "bun:test";
import { from, hasValidPricingDetails, hasValidShippingDetails } from ".";
import { products } from "./fixture";

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
