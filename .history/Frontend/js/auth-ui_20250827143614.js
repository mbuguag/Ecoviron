import { getToken, logout } from './auth.js';

export async function renderAuthArea() {
  const authArea = document.getElementById('authArea');
  if (!authArea) return;

  const token = getToken();
  if (!token) {
    authArea.innerHTML = `
      // <a href="/frontend/auth/login.html">Login</a>
      <a href="/frontend/register.html">Register</a>
    `;
    return;
  }

  try {
    const res = await fetch('http://localhost:8080/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Invalid token or user fetch failed.');

    const user = await res.json();
    const name = user.fullName?.split(' ')[0] || 'User';
    const photo = user.photoUrl || '/frontend/assets/img/default-avatar.png';

    authArea.innerHTML = `
      <div class="user-dropdown">
        <img id="userAvatar" class="avatar-small" src="${photo}" alt="Avatar">
        <span id="userName">${name}</span>
        <div class="dropdown-content">
          <div class="dropdown-header">My Account</div>
          <a href="/frontend/profile.html">Profile</a>
          <button id="logoutBtn">Logout</button>
        </div>
      </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      logout(); // your logout function to clear token
      window.location.href = '/frontend/auth/login.html';
    });

  } catch (error) {
    console.error('Error loading user info:', error);
    authArea.innerHTML = `<a href="/frontend/login.html">Login</a>`;
  }
}

export function renderUserDropdown() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return; // ✅ Prevent crash

  const name = localStorage.getItem("username");
  const photo =
    localStorage.getItem("profileImage") ||
    "/frontend/assets/img/default-avatar.png";

  if (!name) {
    authArea.innerHTML = `<a href="/frontend/auth/login.html">Login</a>`;
    return;
  }

  authArea.innerHTML = `
    <div class="user-dropdown">
      <img class="avatar-small" src="${photo}" alt="${name}" />
      <span>${name.split(" ")[0]}</span>
      <div class="dropdown-content">
        <div class="dropdown-header">My Account</div>
        <a href="/frontend/profile.html">Profile</a>
        <button id="logoutBtn">Logout</button>
      </div>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/frontend/auth/login.html";
  });
}
