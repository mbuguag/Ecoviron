// auth-ui.js
export function renderUserDropdown() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("username");
  const email = localStorage.getItem("userEmail");
  const photo = localStorage.getItem("profileImage")?.startsWith("/uploads")
    ? `https://api.bionix-hse.co.ke${localStorage.getItem("profileImage")}`
    : "/frontend/assets/icons/default-avatar.png";

  // --- Unauthenticated State ---
  if (!token || !name || !email) {
    authArea.innerHTML = `
      <div class="relative group">
        <button class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <i class="fas fa-user text-gray-600"></i>
        </button>
        <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
          <a href="/frontend/auth/login.html" class="block px-4 py-2 hover:bg-gray-100">Login</a>
          <a href="/frontend/auth/register.html" class="block px-4 py-2 hover:bg-gray-100">Register</a>
        </div>
      </div>
    `;
    return;
  }

  // --- Authenticated State ---
  authArea.innerHTML = `
    <div class="relative group">
      <button class="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
        ${name.charAt(0)}
      </button>
      <div class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg p-4 hidden group-hover:block">
        <div class="flex items-center mb-3">
          <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            <img src="${photo}" alt="${name}" class="w-full h-full object-cover"/>
          </div>
          <div class="ml-3">
            <p class="font-medium text-gray-900">${name}</p>
            <p class="text-sm text-gray-500">${email}</p>
          </div>
        </div>
        <a href="/frontend/profile.html" class="block px-4 py-2 hover:bg-gray-100">My Profile</a>
        <a href="/frontend/orders.html" class="block px-4 py-2 hover:bg-gray-100">My Orders</a>
        <button id="logoutBtn" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
          Logout
        </button>
      </div>
    </div>
  `;

  // Logout handler
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/frontend/index.html";
  });
}
