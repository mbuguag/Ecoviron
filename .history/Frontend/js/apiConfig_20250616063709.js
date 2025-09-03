const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isLocalDev 
  ? 'http://localhost:8080/api' 
  : 'https://your-live-api.com/api'; // Replace with production URL