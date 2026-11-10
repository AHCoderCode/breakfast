import { BRAND, BUSINESS_CONFIG, CATEGORIES, COUPONS, PRODUCTS, BUILDER_CHOICES } from "./catalog.js";
import { formatMoney, cartTotals, createOrderId } from "./core.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const STORAGE_KEYS = {
  cart: "morning-house-cart-v1",
  favorites: "morning-house-favorites-v1",
  orders: "morning-house-orders-v1",
  coupon: "morning-house-coupon-v1"
};

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (error) {
    console.warn("Saved data could not be read:", error);
    return fallback;
  }
}
function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Saved data could not be written:", error);
    return false;
  }
}
function escapeHTML(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}
function money(value) {
  return formatMoney(value, BUSINESS_CONFIG.currency, BUSINESS_CONFIG.locale);
}
function byId(id) {
  return PRODUCTS.find(function (product) { return product.id === id; });
}
function randomId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return "line-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}
function dateValue(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}
function prettyDate(dateString) {
  if (!dateString) return "Not selected";
  const date = new Date(dateString + "T12:00:00");
  if (Number.isNaN(date.getTime())) return "Not selected";
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
function prettyTime(timeString) {
  if (!timeString) return "Not selected";
  const parts = timeString.split(":");
  const date = new Date();
  date.setHours(Number(parts[0]), Number(parts[1] || 0), 0, 0);
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);
}
function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length > 4 ? "•••• ••• " + digits.slice(-4) : "••••";
}

const savedCart = safeRead(STORAGE_KEYS.cart, []);
const savedFavorites = safeRead(STORAGE_KEYS.favorites, []);
const savedOrders = safeRead(STORAGE_KEYS.orders, []);
const state = {
  cart: Array.isArray(savedCart) ? savedCart.filter(function (line) {
    return line && line.lineId && line.productId && Number.isFinite(Number(line.unitPrice)) && Number(line.quantity) > 0;
  }) : [],
  favorites: new Set(Array.isArray(savedFavorites) ? savedFavorites.filter(function (id) { return typeof id === "string"; }) : []),
  orders: Array.isArray(savedOrders) ? savedOrders.filter(function (order) { return order && order.id && Array.isArray(order.items); }).slice(0, 30) : [],
  category: "all",
  search: "",
  sort: "popular",
  bestsellersOnly: false,
  vegetarianOnly: false,
  favoritesOnly: false,
  coupon: typeof safeRead(STORAGE_KEYS.coupon, "") === "string" ? safeRead(STORAGE_KEYS.coupon, "") : "",
  product: null,
  checkoutStep: 0,
  checkoutData: {
    name: "",
    phone: "",
    email: "",
    pickupDate: dateValue(1),
    pickupTime: BUSINESS_CONFIG.pickupSlots[0],
    pickupInstructions: "",
    paymentMethod: "pickup"
  },
  activeOrder: null
};

function persistCart() {
  if (!safeWrite(STORAGE_KEYS.cart, state.cart)) showToast("Your bag is available for this visit, but browser storage is unavailable.", "!");
  if (!safeWrite(STORAGE_KEYS.coupon, state.coupon)) console.info("Coupon could not be persisted.");
}
function persistFavorites() {
  if (!safeWrite(STORAGE_KEYS.favorites, Array.from(state.favorites))) {
    showToast("Favourites are available for this visit only.", "!");
  }
}
function persistOrders() {
  if (!safeWrite(STORAGE_KEYS.orders, state.orders)) {
    showToast("This order is available until you close this tab; browser storage is unavailable.", "!");
  }
}

function showToast(message, icon) {
  const region = $("#toast-region");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = "<span>" + escapeHTML(icon || "✳") + "</span><span>" + escapeHTML(message) + "</span>";
  region.appendChild(toast);
  window.setTimeout(function () {
    toast.classList.add("out");
    window.setTimeout(function () { toast.remove(); }, 220);
  }, 2900);
  $("#live-region").textContent = message;
}

function productCard(product) {
  const favorite = state.favorites.has(product.id);
  const category = CATEGORIES.find(function (item) { return item.id === product.category; });
  const badge = product.badge ? '<span class="product-badge">' + escapeHTML(product.badge) + "</span>" : "";
  return '<article class="product-card">' +
    '<div class="product-image-wrap">' +
      '<img src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.name) + '" loading="lazy" onerror="this.style.opacity=0.35">' +
      badge +
      '<button class="favorite-button ' + (favorite ? "is-favorite" : "") + '" data-action="favorite" data-id="' + escapeHTML(product.id) + '" aria-label="' + (favorite ? "Remove " : "Add ") + escapeHTML(product.name) + ' ' + (favorite ? "from" : "to") + ' favourites" aria-pressed="' + favorite + '">' + (favorite ? "♥" : "♡") + "</button>" +
    "</div>" +
    '<div class="product-content">' +
      '<div class="product-meta"><span>' + escapeHTML(category ? category.label : "Breakfast") + '</span><span class="product-rating">★ ' + escapeHTML(product.rating.toFixed(1)) + ' <span style="color:#a59b8e;font-weight:500">(' + escapeHTML(product.reviews) + ')</span></span></div>' +
      "<h3>" + escapeHTML(product.name) + "</h3>" +
      "<p>" + escapeHTML(product.description) + "</p>" +
      '<div class="product-bottom"><strong class="product-price">' + money(product.price) + "</strong>" +
        '<button class="quick-view-link" data-action="open-product" data-id="' + escapeHTML(product.id) + '">Quick view</button>' +
        '<button class="product-add" data-action="open-product" data-id="' + escapeHTML(product.id) + '" aria-label="Customize ' + escapeHTML(product.name) + '">+</button>' +
      "</div>" +
    "</div>" +
  "</article>";
}

function renderCategories() {
  $("#category-tabs").innerHTML = CATEGORIES.map(function (category) {
    return '<button class="category-tab ' + (state.category === category.id ? "active" : "") + '" data-action="category" data-id="' + category.id + '" aria-pressed="' + (state.category === category.id) + '"><span>' + category.icon + "</span>" + escapeHTML(category.label) + "</button>";
  }).join("");
}
function filteredProducts() {
  let products = PRODUCTS.filter(function (product) {
    if (state.category !== "all" && product.category !== state.category) return false;
    if (state.bestsellersOnly && !product.bestseller) return false;
    if (state.vegetarianOnly && !product.vegetarian) return false;
    if (state.favoritesOnly && !state.favorites.has(product.id)) return false;
    if (state.search) {
      const category = CATEGORIES.find(function (item) { return item.id === product.category; });
      const searchable = (product.name + " " + product.description + " " + (category ? category.label : "")).toLowerCase();
      if (!searchable.includes(state.search.toLowerCase())) return false;
    }
    return true;
  });
  if (state.sort === "price-low") products.sort(function (a, b) { return a.price - b.price; });
  else if (state.sort === "price-high") products.sort(function (a, b) { return b.price - a.price; });
  else if (state.sort === "name") products.sort(function (a, b) { return a.name.localeCompare(b.name); });
  else products.sort(function (a, b) { return Number(b.bestseller) - Number(a.bestseller) || b.reviews - a.reviews; });
  return products;
}
function renderMenu() {
  renderCategories();
  const products = filteredProducts();
  $("#product-grid").innerHTML = products.map(productCard).join("");
  $("#product-grid").hidden = products.length === 0;
  $("#menu-empty").hidden = products.length !== 0;
  $("#results-count").textContent = products.length + (products.length === 1 ? " lovely choice" : " lovely choices");
  $("#bestseller-filter").setAttribute("aria-pressed", String(state.bestsellersOnly));
  $("#vegetarian-filter").setAttribute("aria-pressed", String(state.vegetarianOnly));
  $("#favorites-filter").setAttribute("aria-pressed", String(state.favoritesOnly));
}
function renderComboCards() {
  const combos = PRODUCTS.filter(function (product) { return product.category === "combos"; }).slice(0, 3);
  $("#combo-grid").innerHTML = combos.map(function (product) {
    return '<article class="combo-card"><div class="combo-image"><img src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.name) + '" loading="lazy" onerror="this.style.opacity=0.3"></div><div class="combo-body"><span class="combo-kicker">A LITTLE MORE TO LOVE</span><h3>' + escapeHTML(product.name) + '</h3><p>' + escapeHTML(product.description) + '</p><div class="combo-foot"><strong>' + money(product.price) + '</strong><button data-action="open-product" data-id="' + escapeHTML(product.id) + '">Customise ↗</button></div></div></article>';
  }).join("");
}
function renderFavorites() {
  renderMenu();
}
function renderCartCount() {
  const count = state.cart.reduce(function (sum, line) { return sum + Math.max(0, Number(line.quantity) || 0); }, 0);
  $("#cart-count").textContent = String(count);
  $("#drawer-item-count").textContent = "(" + count + ")";
}
function currentTotals() {
  return cartTotals(state.cart, state.coupon, COUPONS, BUSINESS_CONFIG.serviceFee);
}
function lineDescription(line) {
  const labels = Array.isArray(line.options) ? line.options.map(function (option) { return option.label; }).filter(Boolean) : [];
  return labels.join(" · ");
}
function renderCart() {
  renderCartCount();
  const empty = state.cart.length === 0;
  $("#cart-empty").classList.toggle("visible", empty);
  $("#cart-footer").hidden = empty;
  $("#cart-lines").hidden = empty;
  $("#cart-lines").innerHTML = state.cart.map(function (line) {
    const description = lineDescription(line);
    return '<article class="cart-line">' +
      '<div class="cart-line-image"><img src="' + escapeHTML(line.image || "") + '" alt="" loading="lazy" onerror="this.style.opacity=0.25"></div>' +
      '<div class="cart-line-main"><h3>' + escapeHTML(line.name) + '</h3><p>' + escapeHTML(description || "Made just the way you like it") + '</p>' +
        (line.notes ? '<p class="cart-line-notes">Note: ' + escapeHTML(line.notes) + "</p>" : "") +
        '<div class="cart-line-tools"><button data-action="edit-line" data-id="' + escapeHTML(line.lineId) + '">Edit</button><button data-action="remove-line" data-id="' + escapeHTML(line.lineId) + '">Remove</button></div>' +
      "</div>" +
      '<div class="cart-line-side"><strong>' + money(line.unitPrice * line.quantity) + '</strong><div class="qty-control"><button data-action="quantity" data-id="' + escapeHTML(line.lineId) + '" data-delta="-1" aria-label="Decrease quantity">−</button><span>' + line.quantity + '</span><button data-action="quantity" data-id="' + escapeHTML(line.lineId) + '" data-delta="1" aria-label="Increase quantity">+</button></div></div>' +
    "</article>";
  }).join("");
  const totals = currentTotals();
  $("#cart-subtotal").textContent = money(totals.subtotal);
  $("#cart-discount").textContent = "− " + money(totals.discount);
  $("#cart-discount-row").hidden = totals.discount <= 0;
  $("#cart-fee").textContent = money(totals.serviceFee);
  $("#cart-total").textContent = money(totals.total);
  $("#coupon-input").value = state.coupon;
  const message = $("#coupon-message");
  if (state.coupon && COUPONS[state.coupon]) {
    const rule = COUPONS[state.coupon];
    message.textContent = totals.discount > 0 ? rule.label + " applied." : "Add " + money(rule.minimum) + " to use this code.";
    message.classList.toggle("error", totals.discount <= 0);
  } else {
    message.textContent = "";
    message.classList.remove("error");
  }
}
function openCart() {
  $("#cart-backdrop").hidden = false;
  requestAnimationFrame(function () { $("#cart-backdrop").classList.add("visible"); });
  $("#cart-drawer").classList.add("open");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  renderCart();
}
function closeCart() {
  $("#cart-backdrop").classList.remove("visible");
  $("#cart-drawer").classList.remove("open");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  window.setTimeout(function () { $("#cart-backdrop").hidden = true; }, 260);
}
function toggleFavorite(productId) {
  if (state.favorites.has(productId)) {
    state.favorites.delete(productId);
    showToast("Removed from your favourites.", "♡");
  } else {
    state.favorites.add(productId);
    showToast("Saved to your favourites.", "♥");
  }
  persistFavorites();
  renderMenu();
}

function defaultProductOptions(product) {
  const options = {};
  (product.groups || []).forEach(function (group) {
    if (group.type === "multi") options[group.id] = [];
    else {
      const selected = group.options.find(function (option) { return option.selected; });
      options[group.id] = selected ? selected.id : (group.required ? group.options[0].id : "");
    }
  });
  return options;
}
function openProduct(productId, lineToEdit) {
  const product = byId(productId);
  if (!product || !product.available) {
    showToast("This breakfast choice is not available right now.", "!");
    return;
  }
  const options = defaultProductOptions(product);
  if (lineToEdit && lineToEdit.optionIds) {
    Object.keys(lineToEdit.optionIds).forEach(function (key) { options[key] = lineToEdit.optionIds[key]; });
  }
  state.product = {
    productId: productId,
    editLineId: lineToEdit ? lineToEdit.lineId : null,
    quantity: lineToEdit ? lineToEdit.quantity : 1,
    options: options,
    notes: lineToEdit ? (lineToEdit.notes || "") : ""
  };
  renderProductDialog();
  $("#product-dialog").showModal();
}
function selectedProductOptions(product) {
  const result = [];
  (product.groups || []).forEach(function (group) {
    const selected = state.product.options[group.id];
    group.options.forEach(function (option) {
      const isSelected = group.type === "multi" ? Array.isArray(selected) && selected.includes(option.id) : selected === option.id;
      if (isSelected) result.push({ group: group.label, label: group.label + ": " + option.label, optionLabel: option.label, price: Number(option.price) || 0, optionId: option.id });
    });
  });
  return result;
}
function productUnitPrice(product) {
  return product.price + selectedProductOptions(product).reduce(function (sum, option) { return sum + option.price; }, 0);
}
function renderProductDialog() {
  const product = byId(state.product.productId);
  const groups = (product.groups || []).map(function (group) {
    const current = state.product.options[group.id];
    return '<div class="option-group"><div class="option-group-heading"><span>' + escapeHTML(group.label) + '</span><small>' + (group.required ? "CHOOSE ONE" : group.type === "multi" ? "OPTIONAL · CHOOSE ANY" : "OPTIONAL") + "</small></div>" +
      '<div class="option-list">' + group.options.map(function (option) {
        const checked = group.type === "multi" ? Array.isArray(current) && current.includes(option.id) : current === option.id;
        const inputType = group.type === "multi" ? "checkbox" : "radio";
        const inputName = "option-" + group.id;
        return '<label class="option-choice"><input type="' + inputType + '" name="' + escapeHTML(inputName) + '" data-option-group="' + escapeHTML(group.id) + '" data-option-id="' + escapeHTML(option.id) + '" data-option-type="' + escapeHTML(group.type) + '" ' + (checked ? "checked" : "") + '><span>' + escapeHTML(option.label) + '<b>' + (option.price ? "+ " + money(option.price) : "Included") + "</b></span></label>";
      }).join("") + "</div></div>";
  }).join("");
  $("#product-dialog-content").innerHTML = '<div class="product-modal-layout">' +
    '<div class="product-modal-image"><img src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.name) + '" onerror="this.style.opacity=0.25"></div>' +
    '<div class="product-modal-content"><span class="section-kicker">' + (product.bestseller ? "A HOUSE FAVOURITE" : "MADE FOR YOUR MORNING") + '</span><h2 id="product-dialog-title">' + escapeHTML(product.name) + '</h2><p class="product-modal-description">' + escapeHTML(product.description) + '</p><div class="product-modal-price" id="product-modal-price">' + money(productUnitPrice(product)) + '</div>' +
    groups +
    '<label class="special-instructions">A little note for the kitchen <textarea id="product-notes" maxlength="180" placeholder="Anything we should know?">' + escapeHTML(state.product.notes) + '</textarea></label>' +
    '<p class="product-validation" id="product-validation" aria-live="polite"></p>' +
    '<div class="product-modal-bottom"><div class="qty-control"><button data-action="product-quantity" data-delta="-1" aria-label="Decrease quantity">−</button><span id="product-quantity">' + state.product.quantity + '</span><button data-action="product-quantity" data-delta="1" aria-label="Increase quantity">+</button></div><button class="button button-dark" data-action="save-product">' + (state.product.editLineId ? "Save changes" : "Add to bag") + ' · <span id="product-line-total">' + money(productUnitPrice(product) * state.product.quantity) + "</span></button></div></div></div>";
}
function refreshProductPrice() {
  if (!state.product) return;
  const product = byId(state.product.productId);
  const price = productUnitPrice(product);
  $("#product-modal-price").textContent = money(price);
  $("#product-line-total").textContent = money(price * state.product.quantity);
}
function updateProductOption(target) {
  if (!state.product) return;
  const groupId = target.dataset.optionGroup;
  const optionId = target.dataset.optionId;
  if (target.dataset.optionType === "multi") {
    const current = state.product.options[groupId] || [];
    state.product.options[groupId] = target.checked ? current.concat([optionId]) : current.filter(function (id) { return id !== optionId; });
  } else {
    state.product.options[groupId] = optionId;
  }
  refreshProductPrice();
}
function saveProductToCart() {
  if (!state.product) return;
  const product = byId(state.product.productId);
  const requiredMissing = (product.groups || []).some(function (group) {
    return group.required && (!state.product.options[group.id] || (Array.isArray(state.product.options[group.id]) && state.product.options[group.id].length === 0));
  });
  if (requiredMissing) {
    $("#product-validation").textContent = "Please make the required selections first.";
    return;
  }
  const options = selectedProductOptions(product);
  const line = {
    lineId: state.product.editLineId || randomId(),
    productId: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    basePrice: product.price,
    unitPrice: productUnitPrice(product),
    quantity: Math.max(1, Math.min(20, Number(state.product.quantity) || 1)),
    options: options,
    optionIds: JSON.parse(JSON.stringify(state.product.options)),
    notes: ($("#product-notes").value || "").trim()
  };
  if (state.product.editLineId) {
    state.cart = state.cart.map(function (current) { return current.lineId === line.lineId ? line : current; });
    showToast("Your breakfast has been updated.", "✳");
  } else {
    const signature = JSON.stringify([line.productId, line.optionIds, line.notes]);
    const matching = state.cart.find(function (current) {
      return JSON.stringify([current.productId, current.optionIds, current.notes || ""]) === signature;
    });
    if (matching) matching.quantity = Math.min(99, matching.quantity + line.quantity);
    else state.cart.push(line);
    showToast(product.name + " added to your bag.", "＋");
  }
  persistCart();
  renderCart();
  $("#product-dialog").close();
  if ($("#cart-drawer").classList.contains("open")) renderCart();
}
function changeCartQuantity(lineId, delta) {
  const line = state.cart.find(function (item) { return item.lineId === lineId; });
  if (!line) return;
  line.quantity = Math.max(0, Math.min(99, line.quantity + delta));
  if (!line.quantity) state.cart = state.cart.filter(function (item) { return item.lineId !== lineId; });
  persistCart();
  renderCart();
}
function removeCartLine(lineId) {
  state.cart = state.cart.filter(function (item) { return item.lineId !== lineId; });
  persistCart();
  renderCart();
  showToast("Item removed from your bag.", "−");
}
function applyCoupon() {
  const code = ($("#coupon-input").value || "").trim().toUpperCase();
  const message = $("#coupon-message");
  if (!code) {
    state.coupon = "";
    persistCart();
    renderCart();
    message.textContent = "Enter a code to apply a little treat.";
    message.classList.add("error");
    return;
  }
  const rule = COUPONS[code];
  if (!rule) {
    message.textContent = "That code isn't in our little book. Try MORNING10.";
    message.classList.add("error");
    return;
  }
  if (rule.expires && new Date(rule.expires + "T23:59:59") < new Date()) {
    message.textContent = "This code has expired.";
    message.classList.add("error");
    return;
  }
  if (currentTotals().subtotal < rule.minimum) {
    message.textContent = "This code needs an order of " + money(rule.minimum) + " or more.";
    message.classList.add("error");
    return;
  }
  state.coupon = code;
  persistCart();
  renderCart();
  showToast("Lovely! Your " + code + " treat is applied.", "✳");
}

function renderBuilder() {
  Object.keys(BUILDER_CHOICES).filter(function (key) { return key !== "extras"; }).forEach(function (key) {
    const select = $("#builder-" + (key === "mains" ? "main" : key === "sides" ? "side" : "drink"));
    const choices = BUILDER_CHOICES[key];
    select.innerHTML = choices.map(function (item, index) {
      return '<option value="' + escapeHTML(item.id) + '"' + (index === 0 ? " selected" : "") + ">" + escapeHTML(item.label) + " · " + money(item.price) + "</option>";
    }).join("");
  });
  $("#builder-extras").innerHTML = BUILDER_CHOICES.extras.map(function (item) {
    return '<label class="builder-extra-option"><input type="checkbox" value="' + escapeHTML(item.id) + '" data-builder-extra><span>' + escapeHTML(item.label) + ' <b>+' + money(item.price) + "</b></span></label>";
  }).join("");
  updateBuilderTotal();
}
function selectedBuilderItems() {
  const picked = [];
  [
    { key: "mains", selector: "#builder-main", label: "Main" },
    { key: "sides", selector: "#builder-side", label: "Side" },
    { key: "drinks", selector: "#builder-drink", label: "Drink" }
  ].forEach(function (field) {
    const id = $(field.selector).value;
    const item = BUILDER_CHOICES[field.key].find(function (choice) { return choice.id === id; });
    if (item) picked.push({ group: field.label, label: field.label + ": " + item.label, optionLabel: item.label, price: item.price, optionId: item.id });
  });
  $$("[data-builder-extra]:checked").forEach(function (input) {
    const item = BUILDER_CHOICES.extras.find(function (choice) { return choice.id === input.value; });
    if (item) picked.push({ group: "Extra", label: "Extra: " + item.label, optionLabel: item.label, price: item.price, optionId: item.id });
  });
  return picked;
}
function updateBuilderTotal() {
  const total = selectedBuilderItems().reduce(function (sum, item) { return sum + item.price; }, 0);
  $("#builder-total").textContent = money(total);
}
function addBuilderToCart() {
  const options = selectedBuilderItems();
  if (options.length < 3) {
    showToast("Choose a main, a side and a drink first.", "!");
    return;
  }
  const total = options.reduce(function (sum, item) { return sum + item.price; }, 0);
  const reference = byId("classic-combo");
  state.cart.push({
    lineId: randomId(),
    productId: "custom-breakfast",
    name: "Your custom breakfast",
    category: "combos",
    image: reference ? reference.image : "",
    basePrice: total,
    unitPrice: total,
    quantity: 1,
    options: options,
    optionIds: { builder: options.map(function (item) { return item.optionId; }) },
    notes: ""
  });
  persistCart();
  renderCart();
  showToast("Your custom breakfast is in the bag.", "✳");
  openCart();
}

function initCheckout() {
  state.checkoutStep = 0;
  state.checkoutData.pickupDate = dateValue(1);
  state.checkoutData.pickupTime = BUSINESS_CONFIG.pickupSlots[0];
  renderCheckout();
  $("#checkout-dialog").showModal();
}
function checkoutProgress() {
  const labels = ["Your details", "Pickup time", "Review", "Payment"];
  $("#checkout-progress").innerHTML = labels.map(function (label, index) {
    const cls = index === state.checkoutStep ? "active" : index < state.checkoutStep ? "done" : "";
    return '<div class="checkout-progress-step ' + cls + '">' + String(index + 1).padStart(2, "0") + " / " + label + "</div>";
  }).join("");
}
function checkoutStepMarkup() {
  const data = state.checkoutData;
  if (state.checkoutStep === 0) {
    return '<h3 class="checkout-step-heading">First, who is picking up?</h3><div class="checkout-form-grid">' +
      '<div class="form-field full"><label for="checkout-name">Full name *</label><input id="checkout-name" name="name" autocomplete="name" value="' + escapeHTML(data.name) + '" placeholder="Your name" required></div>' +
      '<div class="form-field"><label for="checkout-phone">Phone number *</label><input id="checkout-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="' + escapeHTML(data.phone) + '" placeholder="+92 300 0000000" required><small>Used only for this demo receipt; the saved copy masks the number.</small></div>' +
      '<div class="form-field"><label for="checkout-email">Email (optional)</label><input id="checkout-email" name="email" type="email" autocomplete="email" value="' + escapeHTML(data.email) + '" placeholder="you@example.com"></div>' +
      "</div><p class=\"checkout-error\" id=\"checkout-error\" aria-live=\"polite\"></p>";
  }
  if (state.checkoutStep === 1) {
    const options = Array.from({ length: 7 }, function (_, index) {
      const value = dateValue(index + 1);
      return '<option value="' + value + '"' + (value === data.pickupDate ? " selected" : "") + ">" + escapeHTML(prettyDate(value)) + "</option>";
    }).join("");
    const times = BUSINESS_CONFIG.pickupSlots.map(function (time) {
      return '<option value="' + escapeHTML(time) + '"' + (time === data.pickupTime ? " selected" : "") + ">" + escapeHTML(prettyTime(time)) + "</option>";
    }).join("");
    return '<h3 class="checkout-step-heading">When should we have it ready?</h3><div class="demo-notice"><span>✳</span><span>' + escapeHTML(BUSINESS_CONFIG.pickupHoursLabel) + '. The slots below are examples and are not connected to live availability.</span></div><div class="checkout-form-grid" style="margin-top:13px">' +
      '<div class="form-field"><label for="pickup-date">Pickup date *</label><select id="pickup-date">' + options + "</select></div>" +
      '<div class="form-field"><label for="pickup-time">Pickup time *</label><select id="pickup-time">' + times + "</select></div>" +
      '<div class="form-field full"><label for="pickup-instructions">Pickup notes (optional)</label><textarea id="pickup-instructions" maxlength="180" placeholder="Any helpful collection details?">' + escapeHTML(data.pickupInstructions) + "</textarea></div>" +
      '<div class="form-field full"><small>ASAP pickup is disabled until real business hours and order acceptance are configured.</small></div>' +
      "</div><p class=\"checkout-error\" id=\"checkout-error\" aria-live=\"polite\"></p>";
  }
  if (state.checkoutStep === 2) {
    const totals = currentTotals();
    return '<h3 class="checkout-step-heading">One last look.</h3><div class="checkout-order-summary">' +
      state.cart.map(function (line) {
        return '<div class="checkout-summary-product"><strong>' + escapeHTML(line.quantity + " × " + line.name) + " <span style=\"float:right\">" + money(line.unitPrice * line.quantity) + "</span></strong><small>" + escapeHTML(lineDescription(line)) + "</small></div>";
      }).join("") +
      '<div class="checkout-summary-line"><span>Subtotal</span><strong>' + money(totals.subtotal) + "</strong></div>" +
      (totals.discount ? '<div class="checkout-summary-line"><span>Discount · ' + escapeHTML(state.coupon) + "</span><strong>− " + money(totals.discount) + "</strong></div>" : "") +
      '<div class="checkout-summary-line"><span>Collection fee</span><strong>' + money(totals.serviceFee) + "</strong></div>" +
      '<div class="checkout-summary-line"><strong>Total</strong><strong>' + money(totals.total) + "</strong></div></div>" +
      '<div class="review-detail"><strong>Customer</strong><p>' + escapeHTML(data.name) + " · " + escapeHTML(maskPhone(data.phone)) + (data.email ? " · " + escapeHTML(data.email) : "") + "</p></div>" +
      '<div class="review-detail"><strong>Pickup</strong><p>' + escapeHTML(prettyDate(data.pickupDate)) + " at " + escapeHTML(prettyTime(data.pickupTime)) + "<br>" + escapeHTML(BUSINESS_CONFIG.collectionAddress) + "</p></div>" +
      '<div class="review-detail"><strong>Collection note</strong><p>' + escapeHTML(data.pickupInstructions || "No additional instructions.") + "</p></div>" +
      '<p class="checkout-error" id="checkout-error" aria-live="polite"></p>';
  }
  return '<h3 class="checkout-step-heading">How would you like to pay?</h3>' +
    '<label class="payment-choice"><input type="radio" name="payment-method" value="Pay at pickup" ' + (data.paymentMethod === "Pay at pickup" ? "checked" : "") + '><span><strong>Pay at pickup</strong><small>Settle your bill when you collect your breakfast.</small></span></label>' +
    '<label class="payment-choice"><input type="radio" name="payment-method" value="Cash on collection" ' + (data.paymentMethod === "Cash on collection" ? "checked" : "") + '><span><strong>Cash on collection</strong><small>Pay in cash when collecting your order.</small></span></label>' +
    '<div class="demo-notice" style="margin-top:13px"><span>✳</span><span>Online payments are not configured. No card details are requested or stored.</span></div>' +
    '<p class="checkout-error" id="checkout-error" aria-live="polite"></p>';
}
function renderCheckout() {
  checkoutProgress();
  $("#checkout-content").innerHTML = checkoutStepMarkup() +
    '<div class="checkout-actions">' +
      '<button class="button button-outline" data-action="checkout-back" ' + (state.checkoutStep === 0 ? "disabled" : "") + ">← Back</button>" +
      '<button class="button button-dark" data-action="' + (state.checkoutStep === 3 ? "place-order" : "checkout-next") + '">' + (state.checkoutStep === 3 ? "Create demo order" : "Continue") + " <span>↗</span></button>" +
    "</div>";
}
function validateCheckoutStep() {
  const error = $("#checkout-error");
  if (state.checkoutStep === 0) {
    const name = ($("#checkout-name").value || "").trim();
    const phone = ($("#checkout-phone").value || "").trim();
    const email = ($("#checkout-email").value || "").trim();
    const digits = phone.replace(/\D/g, "");
    if (name.length < 2) { error.textContent = "Please enter your name."; return false; }
    if (digits.length < 7 || digits.length > 15) { error.textContent = "Enter a valid phone number (7–15 digits)."; return false; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { error.textContent = "Please check your email address."; return false; }
    state.checkoutData.name = name;
    state.checkoutData.phone = phone;
    state.checkoutData.email = email;
  } else if (state.checkoutStep === 1) {
    const date = $("#pickup-date").value;
    const time = $("#pickup-time").value;
    if (!date || date < dateValue(1) || date > dateValue(7)) { error.textContent = "Choose one of the available demo pickup dates."; return false; }
    if (!BUSINESS_CONFIG.pickupSlots.includes(time)) { error.textContent = "Choose one of the available demo pickup times."; return false; }
    state.checkoutData.pickupDate = date;
    state.checkoutData.pickupTime = time;
    state.checkoutData.pickupInstructions = ($("#pickup-instructions").value || "").trim();
  }
  return true;
}
function placeDemoOrder() {
  const selectedPayment = $('input[name="payment-method"]:checked');
  if (!selectedPayment) {
    $("#checkout-error").textContent = "Choose a payment method to continue.";
    return;
  }
  state.checkoutData.paymentMethod = selectedPayment.value;
  if (!state.cart.length) {
    $("#checkout-error").textContent = "Your bag is empty. Add a breakfast before placing an order.";
    return;
  }
  const totals = currentTotals();
  const order = {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    customer: {
      name: state.checkoutData.name,
      phone: maskPhone(state.checkoutData.phone)
    },
    pickupDate: state.checkoutData.pickupDate,
    pickupTime: state.checkoutData.pickupTime,
    pickupInstructions: state.checkoutData.pickupInstructions,
    pickupLocation: BUSINESS_CONFIG.collectionAddress,
    items: state.cart.map(function (line) { return JSON.parse(JSON.stringify(line)); }),
    subtotal: totals.subtotal,
    discount: totals.discount,
    serviceFee: totals.serviceFee,
    total: totals.total,
    coupon: state.coupon,
    paymentMethod: state.checkoutData.paymentMethod,
    status: "Demo order created",
    statusIndex: 0,
    isDemo: true
  };
  state.orders.unshift(order);
  state.orders = state.orders.slice(0, 30);
  state.activeOrder = order;
  persistOrders();
  state.cart = [];
  state.coupon = "";
  persistCart();
  renderCart();
  renderOrders();
  $("#checkout-dialog").close();
  openReceipt(order);
  showToast("Your demo receipt is ready. No order was sent to a café.", "✳");
}
function receiptHTML(order) {
  const itemHTML = order.items.map(function (item) {
    const options = lineDescription(item);
    return '<div class="receipt-item"><div>' + escapeHTML(item.quantity + " × " + item.name) + (options ? "<small>" + escapeHTML(options) + "</small>" : "") + (item.notes ? "<small>Note: " + escapeHTML(item.notes) + "</small>" : "") + '</div><strong>' + money(item.unitPrice * item.quantity) + "</strong></div>";
  }).join("");
  const created = new Date(order.createdAt);
  const dateLabel = Number.isNaN(created.getTime()) ? "Not available" : new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(created);
  return '<div class="receipt-paper">' +
    '<div class="receipt-brand"><span class="receipt-brand-mark">✳</span><h2>' + escapeHTML(BRAND.name) + '</h2><p>' + escapeHTML(BRAND.tagline.toUpperCase()) + "</p></div>" +
    '<div class="receipt-title" id="receipt-heading">ORDER RECEIPT</div>' +
    '<div class="receipt-demo-label">DEMO RECEIPT ONLY · This order is saved in this browser. It has not been transmitted to a restaurant or collection team.</div>' +
    '<div class="receipt-meta">' +
      '<div><span>Order ID</span><strong>' + escapeHTML(order.id) + "</strong></div>" +
      '<div><span>Created</span><strong>' + escapeHTML(dateLabel) + "</strong></div>" +
      '<div><span>Customer</span><strong>' + escapeHTML(order.customer.name) + "</strong></div>" +
      '<div><span>Phone</span><strong>' + escapeHTML(order.customer.phone) + "</strong></div>" +
      '<div><span>Pickup date</span><strong>' + escapeHTML(prettyDate(order.pickupDate)) + "</strong></div>" +
      '<div><span>Pickup time</span><strong>' + escapeHTML(prettyTime(order.pickupTime)) + "</strong></div>" +
      '<div style="grid-column:1/-1"><span>Collection location</span><strong>' + escapeHTML(order.pickupLocation) + "</strong></div>" +
    "</div>" +
    '<div class="receipt-items">' + itemHTML + "</div>" +
    '<div class="receipt-totals">' +
      '<div class="receipt-total-line"><span>Subtotal</span><strong>' + money(order.subtotal) + "</strong></div>" +
      (order.discount ? '<div class="receipt-total-line"><span>Discount' + (order.coupon ? " (" + escapeHTML(order.coupon) + ")" : "") + "</span><strong>− " + money(order.discount) + "</strong></div>" : "") +
      '<div class="receipt-total-line"><span>Collection fee</span><strong>' + money(order.serviceFee) + "</strong></div>" +
      '<div class="receipt-total-line grand"><span>Total</span><strong>' + money(order.total) + "</strong></div>" +
    "</div>" +
    '<div class="receipt-meta" style="margin-top:11px"><div><span>Payment method</span><strong>' + escapeHTML(order.paymentMethod) + "</strong></div><div><span>Order status</span><strong>Demo · saved locally</strong></div></div>" +
    '<div class="receipt-footer"><strong>Thank you for choosing a good morning.</strong><small>Your breakfast is a demo order, not a confirmed café order.<br>Pickup time and location are sample settings until configured by the business.</small></div>' +
    "</div>";
}
function openReceipt(order) {
  state.activeOrder = order;
  $("#receipt-print-area").innerHTML = receiptHTML(order);
  $("#receipt-dialog").showModal();
}
function renderOrders() {
  const root = $("#orders-list");
  if (!state.orders.length) {
    root.innerHTML = '<div class="order-empty"><strong>No saved orders just yet.</strong>Your future demo receipts will appear here, saved in this browser.</div>';
    return;
  }
  root.innerHTML = state.orders.map(function (order) {
    return `<article class="order-card"><div><strong>${escapeHTML(order.id)}</strong><small>${escapeHTML(prettyDate(order.pickupDate))} · ${escapeHTML(prettyTime(order.pickupTime))} · ${escapeHTML(order.items.length + (order.items.length === 1 ? " item" : " items"))}</small><small>${money(order.total)} · ${escapeHTML(order.status || "Demo order")}</small></div><div class="order-card-actions"><button class="small-outline-button" data-action="view-order" data-id="${escapeHTML(order.id)}">Details</button><button class="small-outline-button" data-action="view-receipt" data-id="${escapeHTML(order.id)}">Receipt</button></div></article>`;
  }).join("");
}
function openHistory() {
  $("#history-dialog-list").innerHTML = state.orders.length ? state.orders.map(function (order) {
    return '<article class="history-order"><div class="history-order-top"><strong>' + escapeHTML(order.id) + '</strong><span>LOCAL DEMO</span></div><p>' + escapeHTML(prettyDate(order.pickupDate)) + " · " + escapeHTML(prettyTime(order.pickupTime)) + " · " + money(order.total) + "</p><div class=\"history-order-actions\"><button class=\"small-outline-button\" data-action=\"view-order\" data-id=\"" + escapeHTML(order.id) + "\">View details</button><button class=\"small-outline-button\" data-action=\"view-receipt\" data-id=\"" + escapeHTML(order.id) + "\">Open receipt</button></div></article>";
  }).join("") : '<div class="history-empty">No saved orders yet. Your demo receipts will appear here after checkout.</div>';
  $("#history-dialog").showModal();
}
function findOrder(orderId) {
  return state.orders.find(function (order) { return order.id === orderId; });
}
function openOrderDetails(orderId) {
  const order = findOrder(orderId);
  if (!order) return;
  const progress = ["Order placed", "Confirmed", "Preparing", "Ready for pickup", "Completed"];
  const tracker = progress.map(function (label, index) {
    return '<div style="display:flex;align-items:center;gap:9px;padding:7px 0;color:' + (index === 0 ? "#566b48" : "#a59a8d") + ';font-size:9px"><span style="width:17px;height:17px;display:grid;place-items:center;border:1px solid currentColor;border-radius:50%;font-size:8px">' + (index === 0 ? "✓" : index + 1) + "</span>" + label + (index === 0 ? " · saved locally" : " · not connected") + "</div>";
  }).join("");
  const original = receiptHTML(order);
  const statusPanel = '<div class="receipt-status-panel" style="max-width:450px;margin:12px auto;padding:12px 18px;border:1px solid #ece5da;background:#fff"><strong style="font-size:9px">DEMO ORDER PROGRESS</strong>' + tracker + '<small style="display:block;margin-top:7px;color:#93887b;font-size:7px">This progress display is illustrative only. No live restaurant status is available.</small></div>';
  $("#receipt-print-area").innerHTML = original.replace('<div class="receipt-footer">', statusPanel + '<div class="receipt-footer">');
  state.activeOrder = order;
  $("#receipt-dialog").showModal();
}
async function copyOrderId() {
  if (!state.activeOrder) return;
  try {
    await navigator.clipboard.writeText(state.activeOrder.id);
    showToast("Order ID copied.", "✓");
  } catch (error) {
    const text = document.createElement("textarea");
    text.value = state.activeOrder.id;
    document.body.appendChild(text);
    text.select();
    try { document.execCommand("copy"); showToast("Order ID copied.", "✓"); }
    catch (_) { showToast("Copy isn't available in this browser.", "!"); }
    text.remove();
  }
}

function clearFilters() {
  state.category = "all";
  state.search = "";
  state.sort = "popular";
  state.bestsellersOnly = false;
  state.vegetarianOnly = false;
  state.favoritesOnly = false;
  $("#menu-search").value = "";
  $("#menu-sort").value = "popular";
  renderMenu();
}
function scrollToMenu() {
  $("#menu").scrollIntoView({ behavior: "smooth", block: "start" });
}
function handleClick(event) {
  const filterButton = event.target.closest("#bestseller-filter, #vegetarian-filter, #favorites-filter");
  if (filterButton) {
    if (filterButton.id === "bestseller-filter") state.bestsellersOnly = !state.bestsellersOnly;
    if (filterButton.id === "vegetarian-filter") state.vegetarianOnly = !state.vegetarianOnly;
    if (filterButton.id === "favorites-filter") state.favoritesOnly = !state.favoritesOnly;
    renderMenu();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === "category") {
    state.category = id;
    state.favoritesOnly = false;
    renderMenu();
  } else if (action === "favorite") {
    toggleFavorite(id);
  } else if (action === "open-product") {
    openProduct(id);
  } else if (action === "open-cart") {
    openCart();
  } else if (action === "close-cart") {
    closeCart();
  } else if (action === "close-cart-and-menu") {
    closeCart();
    scrollToMenu();
  } else if (action === "remove-line") {
    removeCartLine(id);
  } else if (action === "quantity") {
    changeCartQuantity(id, Number(button.dataset.delta));
  } else if (action === "edit-line") {
    const line = state.cart.find(function (item) { return item.lineId === id; });
    if (line && byId(line.productId)) openProduct(line.productId, line);
    else showToast("This custom breakfast cannot be edited here. Remove it and build another.", "!");
  } else if (action === "apply-coupon") {
    applyCoupon();
  } else if (action === "product-quantity") {
    state.product.quantity = Math.max(1, Math.min(20, state.product.quantity + Number(button.dataset.delta)));
    $("#product-quantity").textContent = state.product.quantity;
    refreshProductPrice();
  } else if (action === "save-product") {
    saveProductToCart();
  } else if (action === "close-dialog") {
    $("#product-dialog").close();
  } else if (action === "add-builder") {
    addBuilderToCart();
  } else if (action === "checkout") {
    if (!state.cart.length) { showToast("Your bag is empty. Find a breakfast first.", "!"); return; }
    closeCart();
    initCheckout();
  } else if (action === "checkout-next") {
    if (validateCheckoutStep()) { state.checkoutStep = Math.min(3, state.checkoutStep + 1); renderCheckout(); }
  } else if (action === "checkout-back") {
    if (state.checkoutStep > 0) { state.checkoutStep -= 1; renderCheckout(); }
  } else if (action === "place-order") {
    placeDemoOrder();
  } else if (action === "close-checkout") {
    $("#checkout-dialog").close();
  } else if (action === "close-receipt") {
    $("#receipt-dialog").close();
  } else if (action === "print-receipt") {
    window.print();
  } else if (action === "copy-order-id") {
    copyOrderId();
  } else if (action === "orders") {
    openHistory();
  } else if (action === "close-history") {
    $("#history-dialog").close();
  } else if (action === "view-receipt") {
    const order = findOrder(id);
    if (order) { $("#history-dialog").close(); openReceipt(order); }
  } else if (action === "view-order") {
    $("#history-dialog").close();
    openOrderDetails(id);
  } else if (action === "clear-filters") {
    clearFilters();
  }
}
function handleChange(event) {
  const target = event.target;
  if (target.matches("[data-option-group]")) {
    updateProductOption(target);
    return;
  }
  if (target.matches("#menu-sort")) {
    state.sort = target.value;
    renderMenu();
  }
  if (target.matches("#bestseller-filter")) {
    state.bestsellersOnly = target.checked || target.getAttribute("aria-pressed") !== "true";
    renderMenu();
  }
  if (target.matches("#vegetarian-filter")) {
    state.vegetarianOnly = target.checked || target.getAttribute("aria-pressed") !== "true";
    renderMenu();
  }
  if (target.matches("#favorites-filter")) {
    state.favoritesOnly = target.checked || target.getAttribute("aria-pressed") !== "true";
    renderMenu();
  }
  if (target.matches("#builder-main, #builder-side, #builder-drink, [data-builder-extra]")) updateBuilderTotal();
}
function handleInput(event) {
  if (event.target.matches("#menu-search")) {
    state.search = event.target.value.trim();
    renderMenu();
    const input = $("#menu-search");
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}
function setupNavigation() {
  const menuButton = $("#mobile-menu-button");
  menuButton.addEventListener("click", function () {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    $("#mobile-nav").hidden = isOpen;
  });
  $$("#mobile-nav a, .desktop-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      $("#mobile-nav").hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
  $$(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      $$(".nav-link").forEach(function (item) { item.classList.remove("active"); });
      link.classList.add("active");
    });
  });
  const header = $(".site-header");
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 12);
  }, { passive: true });
}
function init() {
  $("#current-year").textContent = String(new Date().getFullYear());
  $("#cart-backdrop").addEventListener("click", closeCart);
  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if ($("#cart-drawer").classList.contains("open")) closeCart();
      $("#mobile-nav").hidden = true;
      $("#mobile-menu-button").setAttribute("aria-expanded", "false");
    }
  });
  $$("[data-category-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      state.category = link.dataset.categoryLink;
      renderMenu();
    });
  });
  setupNavigation();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("./service-worker.js").catch(function (error) { console.info("Offline support is unavailable in this browser.", error); }); }, { once: true });
  }
  renderCategories();
  renderMenu();
  renderComboCards();
  renderBuilder();
  renderCart();
  renderOrders();
  if (state.coupon && !COUPONS[state.coupon]) state.coupon = "";
}
init();
