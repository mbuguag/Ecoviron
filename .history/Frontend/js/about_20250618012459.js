import { API_BASE_URL } from './config.js'; // Adjust path if needed

document.addEventListener('DOMContentLoaded', () => {
  fetchAboutContent();
});

function fetchAboutContent() {
  fetch(`${API_BASE_URL}/about`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch about content: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('who-we-are-content').textContent = data.whoWeAre || 'Not available.';
      document.getElementById('mission-content').textContent = data.mission || 'Not available.';
      document.getElementById('vision-content').textContent = data.vision || 'Not available.';
    })
    .catch(error => {
      console.error('Error loading about content:', error);
      document.getElementById('who-we-are-content').textContent = 'Failed to load content.';
      document.getElementById('mission-content').textContent = 'Failed to load content.';
      document.getElementById('vision-content').textContent = 'Failed to load content.';
    });
}
