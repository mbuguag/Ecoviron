import { API_BASE_URL } from "../apiConfig.js";

function setFallback(id) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = "Content not available at the moment.";
    console.log(`✅ Set fallback for element: ${id}`);
  } else {
    console.error(`❌ Element not found: ${id}`);
  }
}

export async function initAboutSection() {
  console.log("🚀 Starting initAboutSection...");
  console.log("📍 API_BASE_URL:", API_BASE_URL);
  
  try {
    const fullUrl = `${API_BASE_URL}/about`;
    console.log("🌐 Fetching from:", fullUrl);
    
    const response = await fetch(fullUrl);
    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("📊 Raw API data:", data);
    console.log("📊 Data type:", Array.isArray(data) ? "Array" : typeof data);
    console.log("📊 Data length:", Array.isArray(data) ? data.length : "N/A");
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No about data available or data is not an array.");
    }

    // Log all available sections
    console.log("📋 Available sections:", data.map(item => item.section));

    const getContent = (section) => {
      console.log(`🔍 Looking for section: "${section}"`);
      
      // Try exact match first
      let item = data.find((entry) => entry.section === section);
      
      // If not found, try case-insensitive
      if (!item) {
        item = data.find((entry) => entry.section.toLowerCase() === section.toLowerCase());
      }
      
      // If still not found, try partial match
      if (!item) {
        item = data.find((entry) => 
          entry.section.toLowerCase().includes(section.toLowerCase()) ||
          section.toLowerCase().includes(entry.section.toLowerCase())
        );
      }
      
      if (item) {
        console.log(`✅ Found content for "${section}":`, item.content?.substring(0, 100) + "...");
        return item.content || "Content is empty.";
      } else {
        console.warn(`⚠️ No content found for section: "${section}"`);
        return "Not available.";
      }
    };

    // Process About Us section
    console.log("🔧 Processing About Us section...");
    const rawAbout = getContent("About Us");
    
    if (rawAbout && rawAbout !== "Not available.") {
      const paragraphs = rawAbout.split(/\n+|(?<=\.)\s+(?=[A-Z])/);
      console.log("📝 Split into paragraphs:", paragraphs.length);
      
      const whoWeAreEl = document.getElementById("who-we-are-content");
      if (whoWeAreEl) {
        whoWeAreEl.innerHTML = paragraphs
          .filter(p => p.trim().length > 0) // Remove empty paragraphs
          .map((p) => `<p>${p.trim()}</p>`)
          .join("");
        console.log("✅ Updated who-we-are-content");
      } else {
        console.error("❌ Element 'who-we-are-content' not found in DOM");
      }
    }

    // Process Mission
    console.log("🔧 Processing Mission section...");
    const missionContent = getContent("mission");
    const missionEl = document.getElementById("mission-content");
    if (missionEl) {
      missionEl.textContent = missionContent;
      console.log("✅ Updated mission-content");
    } else {
      console.error("❌ Element 'mission-content' not found in DOM");
    }

    // Process Vision
    console.log("🔧 Processing Vision section...");
    const visionContent = getContent("vision");
    const visionEl = document.getElementById("vision-content");
    if (visionEl) {
      visionEl.textContent = visionContent;
      console.log("✅ Updated vision-content");
    } else {
      console.error("❌ Element 'vision-content' not found in DOM");
    }

    console.log("🎉 Successfully loaded about content!");

  } catch (error) {
    console.error("💥 Error in initAboutSection:", error);
    console.error("💥 Error stack:", error.stack);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error("🌐 Network error - check if API server is running");
    }
    
    // Check if it's a CORS error
    if (error.message.includes('CORS')) {
      console.error("🚫 CORS error - check server CORS configuration");
    }
    
    ["who-we-are-content", "mission-content", "vision-content"].forEach(setFallback);
  }
}

// Additional debug helper
export function debugAboutAPI() {
  console.log("🔍 Debug info:");
  console.log("- Current URL:", window.location.href);
  console.log("- API_BASE_URL:", API_BASE_URL);
  console.log("- Full endpoint:", `${API_BASE_URL}/about`);
  
  // Test API connectivity
  fetch(`${API_BASE_URL}/about`)
    .then(response => {
      console.log("🔍 API Test - Status:", response.status);
      return response.text();
    })
    .then(text => {
      console.log("🔍 API Test - Raw response:", text);
      try {
        const parsed = JSON.parse(text);
        console.log("🔍 API Test - Parsed JSON:", parsed);
      } catch (e) {
        console.log("🔍 API Test - Not valid JSON");
      }
    })
    .catch(error => {
      console.error("🔍 API Test - Error:", error);
    });
}