import test from "node:test";
import assert from "node:assert/strict";
import {
  cartSubtotal,
  couponDiscount,
  cartTotals,
  createOrderId,
  formatMoney
} from "../core.js";

const coupons = {
  MORNING10: { rate: 0.1, minimum: 0, expires: "2099-01-01" },
  BREAKFAST15: { rate: 0.15, minimum: 1000, expires: "2099-01-01" }
};

test("cart subtotal multiplies each line by its quantity", () => {
  assert.equal(cartSubtotal([
    { unitPrice: 500, quantity: 2 },
    { unitPrice: 250, quantity: 1 }
  ]), 1250);
});

test("cart subtotal ignores invalid and negative quantities", () => {
  assert.equal(cartSubtotal([
    { unitPrice: 500, quantity: -2 },
    { unitPrice: "not-a-price", quantity: 3 },
    { unitPrice: 200, quantity: 2.8 }
  ]), 400);
});

test("percentage coupon applies to eligible subtotal", () => {
  assert.equal(couponDiscount(1200, "MORNING10", coupons), 120);
});

test("coupon minimum is enforced", () => {
  assert.equal(couponDiscount(900, "BREAKFAST15", coupons), 0);
  assert.equal(couponDiscount(1000, "BREAKFAST15", coupons), 150);
});

test("unknown or missing coupons do not discount", () => {
  assert.equal(couponDiscount(1500, "NOTREAL", coupons), 0);
  assert.equal(couponDiscount(1500, "", coupons), 0);
});

test("cart totals cannot become negative", () => {
  assert.deepEqual(cartTotals(
    [{ unitPrice: 100, quantity: 1 }],
    "MORNING10",
    coupons,
    -300
  ), { subtotal: 100, discount: 10, serviceFee: 0, total: 90 });
});

test("order IDs are unique-looking and follow the receipt format", () => {
  assert.match(createOrderId(1794329289000, 0.5), /^AM-\d{10}-[A-F0-9]{6}$/);
});

test("currency formatting uses the configured PKR currency", () => {
  assert.match(formatMoney(1200), /1,?200/);
});
