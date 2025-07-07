const isLocalDev = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// API Configuration
export const API_BASE_URL = isLocalDev 
  ? 'http://localhost:8080/api' 
  : 'https://your-live-api.com/api';

// Path Configuration
export const BASE_PATH = isLocalDev ? '/Frontend/' : '/';