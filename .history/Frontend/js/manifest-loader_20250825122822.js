import { BASE_PATH } from "./apiConfig.js";exportb function loadFaviconAndManifest() {
  const head = document.head;

  // Array of favicons / PWA icons for full compatibility
  const icons = [
    { rel: "icon", type: "image/png", sizes: "72x72", href: "icon-72x72.png" },
    { rel: "icon", type: "image/png", sizes: "96x96", href: "icon-96x96.png" },
    { rel: "icon", type: "image/png", sizes: "128x128", href: "icon-128x128.png" },
    { rel: "icon", type: "image/png", sizes: "144x144", href: "icon-144x144.png" },
    { rel: "icon", type: "image/png", sizes: "192x192", href: "web-app-manifest-192x192.png", purpose: "maskable" },
    { rel: "icon", type: "image/png", sizes: "512x512", href: "web-app-manifest-512x512.png", purpose: "maskable" },
    { rel: "icon", type: "image/svg+xml", href: "favicon.svg" },
    { rel: "shortcut icon", href: "favicon.ico" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "apple-touch-icon.png" },
    { rel: "mask-icon", href: "safari-pinned-tab.svg", color: "#356510" }
  ];

  icons.forEach(({ rel, type, sizes, href, purpose, color }) => {
    const link = document.createElement("link");
    link.rel = rel;
    if (type) link.type = type;
    if (sizes) link.sizes = sizes;
    if (purpose) link.setAttribute("purpose", purpose);
    if (color) link.color = color;
    link.href = `${BASE_PATH}assets/icons/favicons/${href}`;
    head.appendChild(link);
  });

  // Manifest
  const manifestLink = document.createElement("link");
  manifestLink.rel = "manifest";
  manifestLink.href = `${BASE_PATH}assets/icons/favicons/site.webmanifest`;
  head.appendChild(manifestLink);

  // Theme colors
  const metaTheme = document.createElement("meta");
  metaTheme.name = "theme-color";
  metaTheme.content = "#356510";
  head.appendChild(metaTheme);

  const metaMs = document.createElement("meta");
  metaMs.name = "msapplication-TileColor";
  metaMs.content = "#356510";
  head.appendChild(metaMs);

  console.log("✅ All favicons and manifest dynamically loaded with BASE_PATH:", BASE_PATH);
}

// Call it immediately
loadFaviconAndManifest();
