import { mergeGuestCartWithServer } from "./modules/guestCartMerge.js";
import { updateMiniCartCount } from "./cart-actions.js";

// Redirect after login based on context (checkout or normal)
function getPostLoginRedirect() {
  const redirect = sessionStorage.getItem("redirectAfterLogin");
  sessionStorage.removeItem("redirectAfterLogin");

  // Validate the redirect URL for security
  if (redirect) {
    try {
      // Ensure the redirect stays within our domain
      const url = new URL(redirect, window.location.origin);
      if (url.origin === window.location.origin) {
        return redirect;
      }
    } catch (e) {
      console.warn("Invalid redirect URL:", redirect);
    }
  }

  // Default fallback
  return "/frontend/index.html"; // Adjusted to your main page
}

// Login Handler
export function handleLogin(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const button = form.querySelector("button");

    button.disabled = true;
    button.textContent = "Logging in...";

    try {
      // Clear any previous session
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("profileImage");
      localStorage.removeItem("username");
      localStorage.removeItem("userEmail");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.value.trim(),
          password: form.password.value.trim(),
        }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("username", data.fullName || data.name || "User");
      localStorage.setItem("userEmail", data.email);

      if (data.profileImageUrl) {
        localStorage.setItem("profileImage", data.profileImageUrl);
      }

      // Merge guest cart → authenticated cart
      await mergeGuestCartWithServer();
      updateMiniCartCount();

      // Redirect logic
      if (data.role === "ADMIN") {
        window.location.href = "../admin/admin-dashboard.html";
      } else {
        window.location.href = getPostLoginRedirect();
      }
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      button.disabled = false;
      button.textContent = "Login";
    }
  });
}

// Registration Handler
export function handleRegister(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Registering...";

    try {
      const formData = new FormData(form); // automatically collects all input fields including file

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData, // Do NOT set headers — browser will set multipart/form-data with boundary
      });

      const msg = await res.text();

      if (!res.ok) throw new Error(msg);

      sessionStorage.setItem(
        "loginMessage",
        "Account created successfully! Please log in."
      );
      window.location.href = "login.html";
    } catch (err) {
      alert(err.message || "Registration failed");
    } finally {
      button.disabled = false;
      button.textContent = "Register";
    }
  });
}

// Token Refresh (optional)
export async function refreshToken() {
  try {
    const res = await fetch("https://api.bionix-hse.co.ke/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("jwtToken", data.jwtToken);
      return true;
    }
  } catch (err) {
    console.error("Token refresh failed", err);
  }

  return false;
}

// Check login status
export function isLoggedIn() {
  const token = localStorage.getItem("jwtToken");
  return !!token;
}
