import { API_BASE_URL } from "../apiConfig.js";

export async function initAboutSection() {
  try {
    const response = await fetch(`${BASE_PATH}/about`);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("No about data available.");

    const getContent = (section) => {
      const item = data.find((entry) => entry.section.toLowerCase() === section.toLowerCase());
      return item ? item.content : "Not available.";
    };

    const rawAbout = getContent("About Us");
    const paragraphs = rawAbout.split(/\n+|(?<=\.)\s+(?=[A-Z])/);

    document.getElementById("who-we-are-content").innerHTML = paragraphs
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");

    document.getElementById("mission-content").textContent = getContent("mission");
    document.getElementById("vision-content").textContent = getContent("vision");

  } catch (error) {
    console.error("Error loading about content:", error);
    ["who-we-are-content", "mission-content", "vision-content"].forEach(setFallback);
  }
}

