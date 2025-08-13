// utils.js - General utility functions

// Environment detection
export const isLocalDev = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

// Base path configuration (should be defined in your config)
export const BASE_PATH = isLocalDev ? '/frontend/' : '/';

/**
 * Formats a number as KES currency.
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatPrice(amount) {
  return `KES ${amount.toLocaleString()}`;
}

/**
 * Gets a query parameter from URL
 * @param {string} key - The parameter key to retrieve
 * @returns {string|null} The parameter value or null
 */
export function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls to once per interval
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generates unique IDs
 * @param {string} prefix - ID prefix (default: 'id')
 * @returns {string} Generated unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Checks if element is in viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if element is in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 * @param {HTMLElement} element - Target element
 * @param {number} offset - Scroll offset (default: 0)
 */
export function scrollToElement(element, offset = 0) {
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/**
 * Resolves static asset paths
 * @param {string} relativePath - The asset path to resolve
 * @returns {string} Full resolved path
 */
export function getAssetPath(relativePath) {
  relativePath = relativePath.replace(/\\/g, "/").replace(/^\//, "");
  if (relativePath.startsWith("http") || relativePath.startsWith("data:")) {
    return relativePath;
  }
  const path = (BASE_PATH + relativePath).replace(/\/+/g, '/');
  return path;
}

/**
 * Resolves component paths (similar to getAssetPath but with different base)
 * @param {string} relativePath - The component path to resolve
 * @returns {string} Full resolved path
 */
export function resolvePath(relativePath) {
  if (relativePath.startsWith("/") || relativePath.startsWith("http")) {
    return relativePath;
  }
  return (BASE_PATH + relativePath).replace(/\/+/g, '/');
}

// Export all utilities as a namespace if needed
export default {
  isLocalDev,
  BASE_PATH,
  formatPrice,
  getQueryParam,
  debounce,
  throttle,
  generateId,
  isInViewport,
  scrollToElement,
  getAssetPath,
  resolvePath
};