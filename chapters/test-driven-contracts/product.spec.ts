import { describe, expect, test } from "bun:test";
import { fromUnknown } from ".";
import { products } from "./fixture";
import { hasMediaAssets, hasPrice } from "./product";

describe("Product", () => {
  describe("decode", () => {
    test.each(products)("should decode %s", ({ payload }) => {
      const product = fromUnknown(payload);

      expect(() => product).not.toThrow();
      expect(hasPrice(product)).toBe(true);
      expect(hasMediaAssets(product)).toBe(Boolean(payload.mediaAssets));
    });
  });
});
