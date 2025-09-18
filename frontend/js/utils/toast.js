// js/utils/toast.js

export function showToast(message, type = "info") {
  // Remove any existing toast
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger fade-in
  setTimeout(() => toast.classList.add("show"), 50);

  // Auto-remove after 3s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
