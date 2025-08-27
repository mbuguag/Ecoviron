import { getToken, logout } from "./auth.js";
import { API_BASE_URL, resolvePath, getAssetPath } from "../js/apiConfig.js";

export async function renderAuthArea(containerId = "authArea") {
  const authArea = document.getElementById(containerId);
  if (!authArea) return;

  const token = getToken();

  // 🚪 Not logged in → show Account dropdown with Login/Register
  if (!token) {
    authArea.innerHTML = `
      <li class="dropdown header-auth-item">
        <a href="#" class="header-nav-link">Account ▾</a>
        <div class="dropdown-content">
          <a href="${resolvePath("auth/login.html")}">
            <i class="fas fa-sign-in-alt"></i> Login
          </a>
          <a href="${resolvePath("auth/register.html")}">
            <i class="fas fa-user-plus"></i> Register
          </a>
        </div>
      </li>
    `;
    return;
  }

  // 🔐 Logged in → fetch user info and show user dropdown
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) throw new Error("Token invalid");

    const user = await res.json();
    const name = user.fullName?.split(" ")[0] || "User";
    const photo = user.photoUrl || getAssetPath("assets/img/default-avatar.png");

    authArea.innerHTML = `
      <li class="dropdown user-dropdown">
        <a href="#" class="header-nav-link user-trigger">
          <img src="${photo}" alt="${name}" class="avatar-small">
          <span class="username">${name}</span> ▾
        </a>
        <div class="dropdown-content">
          <div class="dropdown-header">
            <img src="${photo}" alt="${name}" class="avatar-medium">
            <div class="user-info">
              <strong>${user.fullName || name}</strong>
              <small>${user.email}</small>
            </div>
          </div>
          <a href="${resolvePath("profile.html")}">
            <i class="fas fa-user"></i> My Profile
          </a>
          <a href="${resolvePath("orders.html")}">
            <i class="fas fa-shopping-bag"></i> My Orders
          </a>
          <a href="${resolvePath("settings.html")}">
            <i class="fas fa-cog"></i> Settings
          </a>
          <hr class="dropdown-divider">
          <button id="logoutBtn" class="dropdown-logout-btn">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </li>
    `;

    // 🚪 Logout functionality
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Show confirmation
        if (confirm("Are you sure you want to logout?")) {
          logout();
          window.location.href = resolvePath("auth/login.html");
        }
      });
    }

  } catch (err) {
    console.error("Error loading user info:", err);
    // Fallback to login/register if user data fails to load
    authArea.innerHTML = `
      <li class="dropdown header-auth-item">
        <a href="#" class="header-nav-link">Account ▾</a>
        <div class="dropdown-content">
          <a href="${resolvePath("auth/login.html")}">
            <i class="fas fa-sign-in-alt"></i> Login
          </a>
          <a href="${resolvePath("auth/register.html")}">
            <i class="fas fa-user-plus"></i> Register
          </a>
          <div class="dropdown-divider"></div>
          <small class="dropdown-error">Session expired</small>
        </div>
      </li>
    `;
  }
}

// Additional CSS styles you'll need to add to your header.css
export const authDropdownStyles = `
/* Auth Area Specific Styles */
.header-auth-item .dropdown-content {
  min-width: 200px;
  right: 0;
}

.user-dropdown .dropdown-content {
  min-width: 250px;
  right: 0;
}

.dropdown-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.dropdown-header .avatar-medium {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.dropdown-header .user-info {
  display: flex;
  flex-direction: column;
}

.dropdown-header .user-info strong {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.dropdown-header .user-info small {
  font-size: 12px;
  color: #666;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 500;
}

.dropdown-content a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
}

.dropdown-content a:hover {
  background-color: #f5f5f5;
}

.dropdown-content a i {
  width: 16px;
  font-size: 14px;
  color: #666;
}

.dropdown-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 8px 0;
}

.dropdown-logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  color: #dc3545;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.dropdown-logout-btn:hover {
  background-color: #fef2f2;
}

.dropdown-logout-btn i {
  width: 16px;
  font-size: 14px;
}

.dropdown-error {
  color: #dc3545;
  padding: 8px 16px;
  font-style: italic;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .user-dropdown .dropdown-content {
    min-width: 220px;
  }
  
  .dropdown-header {
    padding: 10px 12px;
  }
  
  .dropdown-header .avatar-medium {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
}
`;