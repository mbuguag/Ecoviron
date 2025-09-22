// dashboard.js
// Central admin bootstrap + lazy module loader
import { API_ENDPOINTS, API_BASE_URL, authFetch, formatPrice, STATIC_BASE_URL } from './apiConfig.js';

const MODULE_MAP = {
  products: './modules/products.js',
  orders: './modules/orders.js',
  users: './modules/users.js',
  blogs: './modules/blogs.js',
  contacts: './modules/contacts.js',
  quotes: './modules/quotes.js'
};

const moduleCache = new Map();
let chartInstance = null;
let quill = null;

// tiny safe-json helper
function safeJson(res) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// small toast helper
function toast(msg, time = 3500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => el.classList.remove('show'), time);
}

async function checkAuthRedirect() {
  // keep this simple: if no token, redirect to login
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'admin-login.html';
    return false;
  }
  // optionally show user info
  const name = localStorage.getItem('name') || 'Admin';
  document.getElementById('adminWelcome').textContent = `Welcome, ${name}`;
  return true;
}

// Fetch and render dashboard summary + chart
export async function loadDashboardSummary() {
  try {
    const resp = await authFetch(API_ENDPOINTS.admin?.dashboard ?? `${API_BASE_URL}/admin/summary`);
    const data = await safeJson(resp);
    // populate cards
    document.getElementById('total-orders').textContent = data.totalOrders ?? 0;
    document.getElementById('total-users').textContent = data.totalUsers ?? 0;
    document.getElementById('total-products').textContent = data.totalProducts ?? 0;

    // render chart (orderStatus expected { pending, shipped, delivered })
    const ctx = document.getElementById('orderChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    const pending = Number(data.orderStatus?.pending ?? 0);
    const shipped = Number(data.orderStatus?.shipped ?? 0);
    const delivered = Number(data.orderStatus?.delivered ?? 0);

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pending', 'Shipped', 'Delivered'],
        datasets: [{
          label: 'Orders',
          data: [pending, shipped, delivered],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

  } catch (err) {
    console.error('Failed to load summary', err);
    toast('Unable to fetch dashboard summary');
  }
}

// Show/hide sections and lazy-load modules
export async function showSection(sectionId) {
  // hide all admin-section sections
  document.querySelectorAll('.admin-section').forEach(sec => {
    if (sec.id === sectionId) sec.classList.remove('hidden');
    else sec.classList.add('hidden');
  });

  // load dashboard summary every time we visit dashboard
  if (sectionId === 'dashboard') {
    await loadDashboardSummary();
    return;
  }

  // Load module lazily
  if (!MODULE_MAP[sectionId]) {
    console.warn('No module configured for section', sectionId);
    return;
  }

  // if cached, call its show method if present
  if (moduleCache.has(sectionId)) {
    const m = moduleCache.get(sectionId);
    if (typeof m.onShow === 'function') m.onShow();
    return;
  }

  // dynamically import module
  try {
    const mod = await import(MODULE_MAP[sectionId]);
    // module should export { init(container, ctx), onShow? }
    const container = document.getElementById(`${sectionId}-root`);
    const ctx = {
      API_ENDPOINTS,
      API_BASE_URL,
      authFetch,
      formatPrice,
      STATIC_BASE_URL,
      toast,
      showSection
    };
    if (typeof mod.init === 'function') {
      await mod.init(container, ctx);
      moduleCache.set(sectionId, mod);
      if (typeof mod.onShow === 'function') mod.onShow();
    } else {
      console.warn('Module', sectionId, 'does not export init(container, ctx)');
    }
  } catch (err) {
    console.error('Failed to load module', sectionId, err);
    toast(`Failed to load ${sectionId} module`);
  }
}

async function init() {
  const ok = await checkAuthRedirect();
  if (!ok) return;

  // initial dashboard
  await loadDashboardSummary();

  // expose showSection globally (used by inline onclicks)
  window.showSection = showSection;

  // optional: handle hash navigation
  const hash = (location.hash || '').replace('#', '');
  if (hash) {
    // if matches a section - show it
    if (document.getElementById(hash)) {
      showSection(hash);
    }
  }

  // quick keepalive refresh when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) loadDashboardSummary();
  });
}

document.addEventListener('DOMContentLoaded', init);

// small helper exported for other modules
export { toast, safeJson };
