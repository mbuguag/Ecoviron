import { BASE_PATH } from "../apiConfig.js";

export async function initServices() {
  const grid = document.getElementById("dynamic-services-grid");
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE_PATH}/services`);
    if (!res.ok) throw new Error(`Failed to fetch services: ${res.status}`);
    const services = await res.json();

    grid.innerHTML = services
      .map(
        (service) => `
      <div class="service-card">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
        <a href="${service.link}" class="btn-primary">Learn More</a>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading services:", error);
    grid.innerHTML = `<p class="error">Unable to load services at the moment.</p>`;
  }
}