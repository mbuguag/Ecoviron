import { mergeGuestCartWithServer } from "./modules/guestCartMerge.js";
import { updateMiniCartCount } from "./cart-actions.js";

// Redirect after login based on context (checkout or normal)
function getPostLoginRedirect(role = "CUSTOMER") {
  const redirect = sessionStorage.getItem("redirectAfterLogin");
  sessionStorage.removeItem("redirectAfterLogin");

  if (redirect) {
    try {
      const url = new URL(redirect, window.location.origin);
      if (url.origin === window.location.origin) {
        return redirect;
      }
    } catch (e) {
      console.warn("Invalid redirect URL:", redirect);
    }
  }

  // ✅ Role-based fallback
  if (role === "ADMIN") {
    return "/admin/admin-dashboard.html"; // works both locally & on Vercel
  }

  return "/"; // homepage for normal users
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
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("profileImage");
      localStorage.removeItem("username");
      localStorage.removeItem("userEmail");

      const emailField = form.email || form.username; // ✅ support both
      const payload = {
        email: emailField.value.trim(),
        password: form.password.value.trim(),
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      if (!data.token) throw new Error("Login failed: No token received.");

      // ✅ Store consistent keys
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.fullName || "User");
      localStorage.setItem("userEmail", data.email);

      if (data.profileImageUrl) {
        localStorage.setItem("profileImage", data.profileImageUrl);
      }

      // Merge guest cart → authenticated cart
      await mergeGuestCartWithServer();
      updateMiniCartCount();

      // Role-based redirect
      window.location.href = getPostLoginRedirect(data.role);
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
    const res = await fetch("http://localhost:8080/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token); // ✅ updated
      return true;
    }
  } catch (err) {
    console.error("Token refresh failed", err);
  }

  return false;
}

// Check login status
export function isLoggedIn() {
  const token = localStorage.getItem("token");
  return !!token;
}
