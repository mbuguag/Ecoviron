// ==================
// apiConfig.js - Anti-Glitch Version
// ==================

// Detect environment
const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const isPreviewEnv = window.location.hostname.includes("vercel.app");

/**
 * Detect base path for loading components (header, footer, etc.)
 */
function detectComponentsBasePath() {
  if (isLocalDev) {
    return window.location.pathname.includes("/frontend/")
      ? "/frontend/components/"
      : "/components/";
  }
  if (isPreviewEnv) return "https://your-preview-domain.vercel.app/components/";
  return "https://www.bionix-hse.co.ke/components/";
}

// Env config
export const ENV_CONFIG = {
  api: {
    local: "http://localhost:8080/api",
    preview: "https://bionix-1.onrender.com/api",
    production: "https://api.bionix-hse.co.ke/api"
  },
  static: {
    local: "http://localhost:3000",
    preview: "https://your-preview-domain.vercel.app",
    production: "https://www.bionix-hse.co.ke"
  },
  basePath: {
    local: "/",
    preview: "/",
    production: "/"
  }
};

// Exports
export const config = { COMPONENTS_BASE: detectComponentsBasePath() };

export const API_BASE_URL = isLocalDev
  ? ENV_CONFIG.api.local
  : isPreviewEnv
    ? ENV_CONFIG.api.preview
    : ENV_CONFIG.api.production;

export const STATIC_BASE_URL = isLocalDev
  ? ENV_CONFIG.static.local
  : isPreviewEnv
    ? ENV_CONFIG.static.preview
    : ENV_CONFIG.static.production;

export const BASE_PATH = isLocalDev
  ? ENV_CONFIG.basePath.local
  : isPreviewEnv
    ? ENV_CONFIG.basePath.preview
    : ENV_CONFIG.basePath.production;

// Component loading state management
const componentState = new Map();
const loadingPromises = new Map();

/**
 * Helpers
 */
export function formatPrice(amount, currency = "KES") {
  if (isNaN(amount)) return `${currency} 0.00`;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

export function resolvePath(relativePath) {
  if (!relativePath) return BASE_PATH;
  if (/^(http|\/\/)/.test(relativePath)) return relativePath;
  if (relativePath.startsWith("/")) {
    return `${BASE_PATH}${relativePath.slice(1)}`.replace(/\/+/g, "/");
  }
  return `${BASE_PATH}${relativePath}`.replace(/\/+/g, "/");
}

export function getAssetPath(relativePath, bustCache = false) {
  const cleanPath = relativePath.replace(/^\/+/, "");
  const resolvedPath = resolvePath(cleanPath);
  return bustCache
    ? `${resolvedPath}${resolvedPath.includes("?") ? "&" : "?"}t=${Date.now()}`
    : resolvedPath;
}

export function getQueryParam(key, defaultValue = null) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Create smooth transition between states
 */
function createSmoothTransition(container, newContent) {
  return new Promise(resolve => {
    // If content is identical, skip transition
    if (container.innerHTML.trim() === newContent.trim()) {
      resolve();
      return;
    }

    // Create transition wrapper
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: relative;
      overflow: hidden;
      transition: opacity 0.2s ease-in-out;
    `;
    
    // Move existing content to wrapper
    const oldContent = container.innerHTML;
    container.innerHTML = '';
    wrapper.innerHTML = oldContent;
    container.appendChild(wrapper);
    
    // Fade out
    requestAnimationFrame(() => {
      wrapper.style.opacity = '0';
      
      setTimeout(() => {
        // Replace with new content and fade in
        wrapper.innerHTML = newContent;
        wrapper.style.opacity = '1';
        
        // Clean up after transition
        setTimeout(() => {
          container.innerHTML = newContent;
          resolve();
        }, 200);
      }, 200);
    });
  });
}

/**
 * Generate content hash to detect changes
 */
function generateContentHash(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Anti-glitch component loader with intelligent caching and smooth transitions
 */
export async function loadComponent(fileName, containerId, maxRetries = 3) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found for ${fileName}`);
    return false;
  }

  // Prevent concurrent loads of same component
  const loadKey = `${fileName}_${containerId}`;
  if (loadingPromises.has(loadKey)) {
    return await loadingPromises.get(loadKey);
  }

  const loadPromise = loadComponentInternal(fileName, containerId, maxRetries);
  loadingPromises.set(loadKey, loadPromise);
  
  try {
    const result = await loadPromise;
    return result;
  } finally {
    loadingPromises.delete(loadKey);
  }
}

async function loadComponentInternal(fileName, containerId, maxRetries) {
  const container = document.getElementById(containerId);
  const CACHE_KEY = `component_cache_${fileName}`;
  const HASH_KEY = `component_hash_${fileName}`;
  const CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutes
  
  let initialContent = '';
  let hasValidCache = false;

  // 1️⃣ Check for valid cache first
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    const cachedHash = localStorage.getItem(HASH_KEY);
    
    if (cached && cachedHash && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      initialContent = cached.html;
      hasValidCache = true;
      
      // Only update DOM if container is empty or has skeleton
      const currentContent = container.innerHTML.trim();
      const isSkeletonOrEmpty = !currentContent || 
        currentContent.includes('skeleton') || 
        currentContent.includes('Loading');
        
      if (isSkeletonOrEmpty) {
        container.innerHTML = initialContent;
        console.log(`⚡ Using cached ${fileName}`);
      }
    }
  } catch (e) {
    console.warn(`Cache read error for ${fileName}:`, e);
  }

  // 2️⃣ Show skeleton only if no cache and container is empty
  if (!hasValidCache && !container.innerHTML.trim()) {
    const skeletonClass = fileName.replace('.html', '');
    container.innerHTML = `
      <div class="skeleton skeleton-${skeletonClass}" style="
        min-height: ${skeletonClass === 'header' ? '70px' : '200px'};
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
        opacity: 0.7;
      ">
        <div style="padding: 20px; text-align: center; color: #999;">
          Loading ${fileName.replace('.html', '')}...
        </div>
      </div>
      <style>
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      </style>
    `;
  }

  // 3️⃣ Fetch fresh content (background if cached)
  const candidatePaths = [
    `${config.COMPONENTS_BASE}${fileName}`,
    `/frontend/components/${fileName}`,
    `./components/${fileName}`,
    `../components/${fileName}`,
    `${STATIC_BASE_URL}/components/${fileName}`
  ];

  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const url of candidatePaths) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(url, {
          cache: isLocalDev ? "no-store" : "force-cache",
          headers: { Accept: "text/html" },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) continue;

        let html = await response.text();
        html = html.replace(/\${BASE_PATH}/g, BASE_PATH);
        html = html.replace(/\${STATIC_BASE_URL}/g, STATIC_BASE_URL);

        const newHash = generateContentHash(html);
        const oldHash = localStorage.getItem(HASH_KEY);

        // 4️⃣ Only update DOM if content actually changed
        if (newHash !== oldHash || !hasValidCache) {
          await createSmoothTransition(container, html);
          
          // Update cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({ 
            html, 
            timestamp: Date.now() 
          }));
          localStorage.setItem(HASH_KEY, newHash);
          
          console.log(`✅ Updated ${fileName} from ${url}`);
        } else {
          console.log(`📋 ${fileName} unchanged`);
        }

        return true;
      } catch (err) {
        lastError = err;
        if (err.name === 'AbortError') {
          console.warn(`⏱️ Timeout loading ${fileName} from ${url}`);
        }
      }
    }
    
    if (attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 5000)));
    }
  }

  console.error(`❌ Failed to load ${fileName}:`, lastError?.message || 'Unknown error');
  
  // Show error only if no cached content exists
  if (!hasValidCache && !isLocalDev) {
    container.innerHTML = `
      <div class="component-error" style="
        padding: 20px;
        text-align: center;
        color: #d32f2f;
        background: #ffebee;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        margin: 10px 0;
      ">
        <strong>⚠️ Failed to load ${fileName.replace('.html', '')}</strong>
        <br>
        <button onclick="window.location.reload()" style="
          margin-top: 10px;
          padding: 8px 16px;
          background: #d32f2f;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Retry</button>
      </div>`;
  }
  
  return hasValidCache; // Return true if we at least have cached content
}

/**
 * Enhanced batch loader with better error handling
 */
export async function loadComponents(components) {
  // Pre-warm containers to prevent layout shift
  components.forEach(({ containerId, fileName }) => {
    const container = document.getElementById(containerId);
    if (container && !container.innerHTML.trim()) {
      const skeletonClass = fileName.replace('.html', '');
      container.innerHTML = `
        <div class="skeleton skeleton-${skeletonClass}" style="min-height: ${skeletonClass === 'header' ? '70px' : '100px'};">
          Loading...
        </div>
      `;
    }
  });

  const results = await Promise.allSettled(
    components.map(({ fileName, containerId }) =>
      loadComponent(fileName, containerId).then(success => ({ fileName, success }))
    )
  );

  const summary = {};
  results.forEach((res, i) => {
    const { fileName } = components[i];
    summary[fileName] = res.status === "fulfilled" ? res.value.success : false;
  });

  console.log("📦 Component load summary:", summary);
  return summary;
}

// Visibility API to prevent unnecessary updates when tab is hidden
let isTabVisible = true;

document.addEventListener('visibilitychange', () => {
  isTabVisible = !document.hidden;
});

// Clean up old cache entries periodically
function cleanupCache() {
  const keys = Object.keys(localStorage);
  const now = Date.now();
  const maxAge = 1000 * 60 * 60; // 1 hour
  
  keys.forEach(key => {
    if (key.startsWith('component_cache_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && now - data.timestamp > maxAge) {
          localStorage.removeItem(key);
          localStorage.removeItem(key.replace('cache_', 'hash_'));
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    }
  });
}

// Run cleanup on page load
setTimeout(cleanupCache, 1000);

// Debug environment
console.log("🚀 Environment:", { 
  isLocalDev, 
  isPreviewEnv, 
  BASE_PATH, 
  API_BASE_URL, 
  STATIC_BASE_URL, 
  COMPONENTS_BASE: config.COMPONENTS_BASE 
});