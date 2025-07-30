// Load user info from localStorage
document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("userEmail") || "user@example.com";
  const photo =
    localStorage.getItem("profileImage") || "../assets/img/default-avatar.png";

  document.getElementById("userName").textContent = name;
  document.getElementById("firstName").textContent = name.split(" ")[0];
  document.getElementById("userEmail").textContent = email;
  document.getElementById("profilePic").src = photo;

  // Logout logic
  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "/frontend/auth/login.html";
  });
});
