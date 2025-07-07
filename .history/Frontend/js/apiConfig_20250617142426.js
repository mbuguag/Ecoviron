const isLocalDev = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// API Configuration
export const API_BASE_URL = isLocalDev 
  ? 'http://localhost:8080/api' 
  : 'https://your-live-api.com/api';

// Frontend Path Configuration
export const BASE_PATH = isLocalDev 
  ? 'Frontend/'  // Local development with Frontend folder
  : '';          // Production - files are at root

  // Component Path Configuration
export const COMPONENTS_BASE = (() => {
  const path = window.location.pathname;
  if (path.includes('/blog/') || path.includes('/services/') || 
      path.includes('/admin/') || path.includes('/auth/')) {
    return '../components/';
  }
  return 'components/';
})();