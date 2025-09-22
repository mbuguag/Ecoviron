// modules/products.js
// simple products module scaffold

export async function init(container, ctx) {
  // container is the DOM node where the module should attach UI
  container.innerHTML = `
    <div id="products-module">
      <div style="margin-bottom:12px">
        <button id="refreshProducts" class="btn">Refresh</button>
        <button id="openAddProduct" class="btn">Add Product</button>
      </div>
      <div id="products-list">Loading products…</div>
    </div>
  `;

  document.getElementById('refreshProducts').addEventListener('click', () => loadProducts(container, ctx));
  // openAddProduct can show a modal or navigate to product edit section — implement later
  document.getElementById('openAddProduct').addEventListener('click', () => ctx.toast('Add product UI not implemented yet'));

  // initial load
  await loadProducts(container, ctx);
}

export function onShow() {
  // called when section becomes visible again
  // (not required but useful)
}

/* ---------- helper ---------- */
async function loadProducts(container, ctx) {
  const list = container.querySelector('#products-list');
  list.textContent = 'Fetching products...';

  try {
    // prefer admin.products if available
    const prodEndpoint = ctx.API_ENDPOINTS.admin?.products ?? ctx.API_ENDPOINTS.products ?? `${ctx.API_BASE_URL}/products`;
    const res = await ctx.authFetch(prodEndpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      list.innerHTML = '<div>No products found.</div>';
      return;
    }

    // render a simple table
    const rows = products.map(p => `
      <tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.description || '')}</td>
        <td>${p.price != null ? (ctx.formatPrice ? ctx.formatPrice(p.price) : ('KES ' + Number(p.price).toFixed(2))) : 'N/A'}</td>
        <td>${p.category?.name ?? '—'}</td>
        <td><img src="${p.imageUrl ? p.imageUrl : ''}" alt="${escapeHtml(p.name)}" width="60"/></td>
        <td>
          <button data-id="${p.id}" class="edit-product">Edit</button>
          <button data-id="${p.id}" class="delete-product">Delete</button>
        </td>
      </tr>
    `).join('');

    list.innerHTML = `
      <table>
        <thead>
          <tr><th>Name</th><th>Description</th><th>Price</th><th>Category</th><th>Image</th><th>Actions</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    // attach listeners
    list.querySelectorAll('.edit-product').forEach(btn => btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      ctx.toast(`Edit product ${id} — implement editor (later)`);
    }));
    list.querySelectorAll('.delete-product').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!confirm('Delete this product?')) return;
      try {
        const delRes = await ctx.authFetch(`${prodEndpoint}/${id}`, { method: 'DELETE' });
        if (!delRes.ok) throw new Error(`Delete failed: ${delRes.status}`);
        ctx.toast('Product deleted');
        loadProducts(container, ctx);
      } catch (err) {
        console.error('Delete error', err);
        ctx.toast('Failed to delete product');
      }
    }));

  } catch (err) {
    console.error('Products load failed', err);
    list.innerHTML = `<div style="color:#b91c1c">Error loading products.</div>`;
    ctx.toast('Error loading products');
  }
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}
