import { API_BASE_URL } from "../apiConfig.js";
import { loadLayoutComponents } from "./modules/components.js";

// State management
let aboutData = [];

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await loadLayoutComponents();
  await initAboutSection();
});

/** Main initialization function */
export async function initAboutSection() {
  try {
    aboutData = await fetchAboutData();
    renderAboutContent();
  } catch (error) {
    handleAboutError(error);
  }
}

/** Fetch about data from API */
async function fetchAboutData() {
  const response = await fetch(`${API_BASE_URL}/about`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No about data available");
  }

  return data;
}

/** Render about content to the DOM */
function renderAboutContent() {
  const getContent = (section) => {
    const item = aboutData.find((entry) => 
      entry.section?.toLowerCase() === section.toLowerCase()
    );
    return item ? item.content : "Content not available at the moment.";
  };

  renderWhoWeAre(getContent("About Us"));
  renderMission(getContent("mission"));
  renderVision(getContent("vision"));
}

/** Render Who We Are section with paragraph formatting */
function renderWhoWeAre(content) {
  const container = document.getElementById("who-we-are-content");
  if (!container) return;

  const paragraphs = content.split(/\n+|(?<=\.)\s+(?=[A-Z])/);
  container.innerHTML = paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${p}</p>`)
    .join("");
}

/** Render Mission section */
function renderMission(content) {
  setElementContent("mission-content", content);
}

/** Render Vision section */
function renderVision(content) {
  setElementContent("vision-content", content);
}

/** Set element content with fallback */
function setElementContent(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = content || "Content not available at the moment.";
  }
}

/** Handle errors in about section */
function handleAboutError(error) {
  console.error("Error loading about content:", error);
  
  // Set fallback for all about sections
  const aboutSections = ["who-we-are-content", "mission-content", "vision-content"];
  aboutSections.forEach(sectionId => setElementContent(sectionId, "Content not available at the moment."));
  
  // Optional: Show user-friendly error message
  showErrorMessage("Failed to load about content. Please try again later.");
}

/** Show error message to user (following product.js pattern) */
function showErrorMessage(message) {
  // Create error element similar to product.js pattern
  const errorEl = document.createElement("div");
  errorEl.className = "error-message";
  errorEl.innerHTML = `<p>${message}</p>`;
  
  // Prepend to about container or main content
  const aboutContainer = document.querySelector(".about-container") || document.querySelector("main");
  if (aboutContainer) {
    aboutContainer.prepend(errorEl);
    
    // Auto-remove after delay
    setTimeout(() => {
      if (errorEl.parentNode) {
        errorEl.remove();
      }
    }, 5000);
  }
}