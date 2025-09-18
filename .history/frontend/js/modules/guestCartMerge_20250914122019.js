// cart/mergeGuestCart.js
import { getGuestCart, clearGuestCart } from "../guestCart.js";
import { CartAPI } from "../cart/cart-api.js";
import { fetchAllProducts } from "../api.js"; // or your existing fetchAllProducts

// concurrency helper
async function mapWithConcurrency(iterable, fn, concurrency = 4) {
  const results = [];
  const executing = [];
  for (const item of iterable) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.push(p);
    if (executing.length >= concurrency) {
      await Promise.race(executing).catch(() => {});
      // remove settled
      for (let i = executing.length - 1; i >= 0; i--) {
        if (executing[i].settled) executing.splice(i, 1);
      }
    }
  }
  return Promise.all(results);
}

// If CartAPI supports bulk add, use it; otherwise fall back
async function addItemsBulkIfPossible(items) {
  if (!items || items.length === 0) return { success: [], failed: [] };

  if (typeof CartAPI.addItemsBulk === "function") {
    try {
      const res = await CartAPI.addItemsBulk(items);
      return res; // expected shape: { success: [...], failed: [...] }
    } catch (err) {
      console.warn("Bulk add failed, falling back to single adds", err);
    }
  }

  // fallback: controlled parallel adds
  const success = [];
  const failed = [];

  await mapWithConcurrency(
    items,
    async (it) => {
      try {
        await CartAPI.addItem(it.productId, it.quantity, { variantId: it.variantId, attrs: it.attrs });
        success.push(it);
      } catch (err) {
        failed.push({ item: it, error: err });
      }
    },
    4
  );

  return { success, failed };
}

export async function mergeGuestCartToBackend() {
  const guestCart = getGuestCart();
  if (!guestCart || guestCart.length === 0) return { merged: [], skipped: [] };

  // Dedupe by productId+variantId — sum quantities
  const dedupeMap = new Map();
  for (const item of guestCart) {
    const key = `${item.productId}::${item.variantId || ""}`;
    const existing = dedupeMap.get(key);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, 999);
    } else {
      dedupeMap.set(key, { ...item });
    }
  }
  const deduped = Array.from(dedupeMap.values());

  // Validate against current products (to report unavailable items)
  let availableIds = new Set();
  try {
    const products = await fetchAllProducts(); // returns list with id
    products.forEach((p) => availableIds.add(p.id));
  } catch (err) {
    // If product list fetch fails, still attempt merge but warn
    console.warn("Could not fetch product list for validation; attempting best-effort merge.", err);
  }

  const toMerge = [];
  const skipped = [];

  for (const item of deduped) {
    if (availableIds.size && !availableIds.has(item.productId)) {
      skipped.push(item);
    } else {
      toMerge.push(item);
    }
  }

  const { success, failed } = await addItemsBulkIfPossible(toMerge);

  // Clear guest cart but keep skipped items if any (so user can view)
  if (failed.length === 0) {
    clearGuestCart();
  } else {
    // keep items that failed + skipped in guest cart so user doesn't lose them
    const keep = [...failed.map(f => f.item), ...skipped];
    // If keep empty, clear
    if (keep.length === 0) clearGuestCart();
    else localStorage.setItem("guest_cart", JSON.stringify(keep));
  }

  return {
    merged: success,
    failed,
    skipped
  };
}
