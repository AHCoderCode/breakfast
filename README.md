# Morning House — Breakfast Takeaway

A responsive, frontend-first breakfast ordering experience built as a dependency-free static web app.

## Run locally

This project uses browser-native HTML, CSS and JavaScript modules. It has no third-party runtime dependencies.

```bash
npm run build
npm test
```

Serve the project root with any static HTTP server while developing. For example, use the VS Code Live Server extension or `npx serve .`.

## What is included

- Responsive brand homepage, food menu, category navigation and mobile menu.
- Live menu search, category filtering, best-seller and vegetarian filters, favourites and sorting.
- Product quick views with required selections, optional add-ons, quantity, notes and dynamic pricing.
- Persistent shopping bag, quantity updates, edit/remove actions and demonstration coupon codes.
- Build-your-own breakfast configurator and combo customisation.
- Multi-step takeaway checkout with validation, sample pickup slots and pay-at-pickup choices.
- Local demonstration order creation, unique order IDs, printable receipt, browser print-to-PDF and order history.
- Explicit demo labels: orders are not sent to a restaurant, pickup slots are not live, and online payments are not enabled.

## Central configuration

- `catalog.js`: product catalog, product option groups, PKR currency, pickup examples, placeholder collection address and demo coupon rules.
- `core.js`: price formatting, cart calculations, coupon maths and order ID generation.
- `app.js`: page rendering, client-side state, interactions, local persistence and checkout/receipt flow.
- `styles.css`: responsive visual system, interaction states, reduced-motion support and print styling.

Before using this for a real business, replace the placeholder address and sample pickup schedule in `catalog.js`, confirm prices and ingredients, and connect a secure order-submission service. Do not treat the browser-saved demo orders as restaurant orders.

## Persistence and privacy

The cart, favourites and demonstration order history use this browser's local storage. Customer phone numbers are masked in saved receipts. The app does not collect card details, authenticate customers or send order data to a server.

## Deployment

The repository is linked to Vercel and can be served from its root as a static site. The current implementation is on the `feature/premium-breakfast-ordering` branch. Merge it into `main` only after reviewing and authorising a production release.
