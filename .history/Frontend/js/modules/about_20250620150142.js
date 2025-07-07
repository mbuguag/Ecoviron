import { API_BASE_URL } from '../apiConfig.js';

export function initAboutSection() {
  return fetch(`${API_BASE_URL}/about`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch about content: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const about = data[0];
        document.getElementById('who-we-are-content').textContent = about.whoWeAre || 'Not available.';
        document.getElementById('mission-content').textContent = about.mission || 'Not available.';
        document.getElementById('vision-content').textContent = about.vision || 'Not available.';
      } else {
        throw new Error('No about data available.');
      }
    })
    .catch(error => {
      console.error('Error loading about content:', error);
      document.getElementById('who-we-are-content').textContent = 'Failed to load content.';
      document.getElementById('mission-content').textContent = 'Failed to load content.';
      document.getElementById('vision-content').textContent = 'Failed to load content.';
    });
}
