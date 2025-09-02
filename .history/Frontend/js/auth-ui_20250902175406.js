// auth-ui.js

export function renderUserDropdown() {
  const authContainers = [
    document.getElementById("auth-container"),
    document.getElementById("auth-container-mobile"),
  ].filter(Boolean);

  if (authContainers.length === 0) return;

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("username");
  const email = localStorage.getItem("userEmail");
  const photo = localStorage.getItem("profileImage")?.startsWith("/uploads")
    ? `https://api.bionix-hse.co.ke${localStorage.getItem("profileImage")}`
    : `${window.BASE_PATH || ""}frontend/assets/icons/default-avatar.png`;

  authContainers.forEach((container) => {
    if (!token || !name || !email) {
      // --- Guest state ---
      container.innerHTML = `
        <a href="#" class="header-nav-link">
          <i class="fas fa-user"></i>
        </a>
        <div class="dropdown-content">
          <span class="dropdown-header">My Account</span>
          <a href="${BASE_PATH}auth/login.html" class="auth-login-link">
            <i class="fas fa-sign-in-alt"></i> Login
          </a>
          <a href="${BASE_PATH}auth/register.html" class="auth-register-link">
            <i class="fas fa-user-plus"></i> Register
          </a>
        </div>
      `;
    } else {
      // --- Authenticated state ---
      container.innerHTML = `
        <a href="#" class="header-nav-link">
          <div class="avatar-circle">${name.charAt(0)}</div>
        </a>
        <div class="dropdown-content">
          <div class="dropdown-user-info">
            <div class="avatar-circle-sm">${name.charAt(0)}</div>
            <div>
              <p class="user-name">${name}</p>
              <p class="user-email">${email}</p>
            </div>
          </div>
          <a href="${BASE_PATH}profile.html" class="auth-profile-link">
            <i class="fas fa-user"></i> Profile
          </a>
          <a href="${BASE_PATH}orders.html" class="auth-orders-link">
            <i class="fas fa-box"></i> My Orders
          </a>
          <a href="#" class="auth-logout-link">
            <i class="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      `;

      // Attach logout listener
      container.querySelector(".auth-logout-link").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = `${BASE_PATH}index.html`;
      });
    }
  });
}
