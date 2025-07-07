import { API_BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/about`);
    const data = await response.json();

    data.forEach(section => {
      if (section.section === 'whoWeAre') {
        document.querySelector('.about-section p').innerText = section.content;
      } else if (section.section === 'mission') {
        document.querySelector('.mission-vision-section .grid-two-columns div:nth-child(1) p').innerText = section.content;
      } else if (section.section === 'vision') {
        document.querySelector('.mission-vision-section .grid-two-columns div:nth-child(2) p').innerText = section.content;
      }
    });
  } catch (err) {
    console.error("Failed to load About content:", err);
  }
});
