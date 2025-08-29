export function initBreadcrumbs() {
document.addEventListener("DOMContentLoaded", () => {
  const breadcrumbContainer = document.createElement("nav");
  breadcrumbContainer.className = "breadcrumb";
  breadcrumbContainer.setAttribute("aria-label", "Breadcrumb");

  const ol = document.createElement("ol");

  // Map page filenames to friendly titles + parent sections
  const breadcrumbMap = {
    // Root
    "index.html": { title: "Home" },

    // Static pages
    "about.html": { title: "About Us", parent: "index.html" },
    "contact.html": { title: "Contact", parent: "index.html" },
    "profile.html": { title: "Profile", parent: "index.html" },

    // Services section
    "services.html": { title: "Services", parent: "index.html" },
    "safety-Gear.html": { title: "Safety Gear", parent: "services.html" },
    "hygiene-survey.html": { title: "Hygiene Survey", parent: "services.html" },
    "NEMA-Audits.html": { title: "NEMA Audits", parent: "services.html" },
    "sustainability.html": { title: "Sustainability", parent: "services.html" },
    "wash-wastewater.html": { title: "Wash & Wastewater", parent: "services.html" },
    "quote-modal.html": { title: "Request a Quote", parent: "services.html" },

    // Ecommerce section
    "product-grid.html": { title: "Shop", parent: "index.html" },
    "product-details.html": { title: "Product Details", parent: "product-grid.html" },
    "cart.html": { title: "Cart", parent: "product-grid.html" },
    "checkout.html": { title: "Checkout", parent: "cart.html" },
    "order-success.html": { title: "Order Success", parent: "checkout.html" },
    "wishlist.html": { title: "Wishlist", parent: "product-grid.html" },

    // Blog section (you can expand)
    "blog.html": { title: "Blog", parent: "index.html" },
  };

  // Helper: build breadcrumb trail recursively
  function buildTrail(filename) {
    const item = breadcrumbMap[filename];
    if (!item) return [];

    const trail = [];
    if (item.parent) {
      trail.push(...buildTrail(item.parent));
    }

    trail.push({ filename, title: item.title });
    return trail;
  }

  // Detect current page
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf("/") + 1) || "index.html";

  const trail = buildTrail(filename);

  // Build DOM
  trail.forEach((crumb, index) => {
    const li = document.createElement("li");

    if (index === trail.length - 1) {
      li.textContent = crumb.title;
      li.setAttribute("aria-current", "page");
    } else {
      const a = document.createElement("a");
      a.href = "/" + crumb.filename;
      a.textContent = crumb.title;
      li.appendChild(a);
    }

    ol.appendChild(li);
  });

  breadcrumbContainer.appendChild(ol);

  // Insert after header
  const header = document.querySelector("header");
  if (header) {
    header.insertAdjacentElement("afterend", breadcrumbContainer);
  } else {
    document.body.insertAdjacentElement("afterbegin", breadcrumbContainer);
  }
});
