import { describe, expect, test } from "bun:test";
import { fromUnknown } from ".";
import { products } from "./fixture";
import { hasPrice } from "./product";

describe("Product", () => {
  describe("decode", () => {
    test.each(
      products
    )("should decode a valid product contract for %s", (_label, payload) => {
      const product = fromUnknown(payload);

      expect(() => product).not.toThrow();

      expect(hasPrice(product)).toBe(true);
    });
  });
});
