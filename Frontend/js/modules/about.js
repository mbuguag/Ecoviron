import { API_BASE_URL } from '../apiConfig.js';

export function initAboutSection() {
  return fetch(`${API_BASE_URL}/about`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch about content: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const getContent = (section) => {
          const item = data.find((entry) => entry.section === section);
          return item ? item.content : "Not available.";
        };

        document.getElementById("who-we-are-content").textContent =
          getContent("whoWeAre");
        document.getElementById("mission-content").textContent =
          getContent("mission");
        document.getElementById("vision-content").textContent =
          getContent("vision");
      } else {
        throw new Error("No about data available.");
      }
    })

    .catch((error) => {
      console.error("Error loading about content:", error);
      document.getElementById("who-we-are-content").textContent =
        "Failed to load content.";
      document.getElementById("mission-content").textContent =
        "Failed to load content.";
      document.getElementById("vision-content").textContent =
        "Failed to load content.";
    });
}
