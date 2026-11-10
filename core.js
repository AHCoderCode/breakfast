export function formatMoney(value, currency = "PKR", locale = "en-PK") {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PKR" ? 0 : 2
  }).format(amount);
}

export function cartSubtotal(items = []) {
  return items.reduce((total, item) => {
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
    return total + unitPrice * quantity;
  }, 0);
}

export function couponDiscount(subtotal, coupon, coupons) {
  if (!coupon || !coupons[coupon]) return 0;
  const rule = coupons[coupon];
  const amount = Math.max(0, Number(subtotal) || 0);
  if (amount < (rule.minimum || 0)) return 0;
  if (rule.expires && new Date(rule.expires + "T23:59:59") < new Date()) return 0;
  return Math.min(amount, Math.round(amount * rule.rate));
}

export function cartTotals(items, coupon, coupons, serviceFee = 0) {
  const subtotal = cartSubtotal(items);
  const discount = couponDiscount(subtotal, coupon, coupons);
  const fee = Math.max(0, Number(serviceFee) || 0);
  return {
    subtotal,
    discount,
    serviceFee: fee,
    total: Math.max(0, subtotal - discount + fee)
  };
}

export function createOrderId(now = Date.now(), random = Math.random()) {
  const stamp = new Date(now).toISOString().replace(/[-:TZ.]/g, "").slice(2, 12);
  const suffix = Math.floor(random * 0xffffff).toString(16).padStart(6, "0").toUpperCase();
  return `AM-${stamp}-${suffix}`;
}
