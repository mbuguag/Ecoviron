import { layoutLoaded } from "./main.js";

const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", async () => {
  await layoutLoaded;

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  loadUserProfile();
  setupSidebarNavigation();
  setupProfileForm();
  setupLogout();
});

async function loadUserProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` },
    });
    const user = await res.json();

    document.getElementById("profile-name").value = user.fullName || "";
    document.getElementById("profile-email").value = user.email || "";
    document.getElementById("current-profile-pic").src =
      user.profilePicture || "/images/default-profile.png";
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

function setupSidebarNavigation() {
  const links = document.querySelectorAll(".sidebar-link");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = e.target.getAttribute("data-target");

      document.querySelectorAll(".profile-section").forEach((section) => {
        section.style.display = "none";
      });

      document.getElementById(target).style.display = "block";
    });
  });
}

function setupProfileForm() {
  const form = document.getElementById("profile-form");
  const fileInput = document.getElementById("profile-pic");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", document.getElementById("profile-name").value);
    formData.append("email", document.getElementById("profile-email").value);
    if (fileInput.files[0]) {
      formData.append("profilePicture", fileInput.files[0]);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");
      alert("Profile updated successfully!");
      loadUserProfile(); // Refresh profile
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwtToken");
      window.location.href = "/login.html";
    });
  }
}
