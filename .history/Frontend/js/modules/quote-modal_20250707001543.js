export async function loadQuoteModal() {
  try {
    const modalContainer = document.createElement("div");
    const response = await fetch("/frontend/services/quote-modal.html");
    const html = await response.text();
    modalContainer.innerHTML = html;
    document.body.appendChild(modalContainer);

   
    const toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast hidden";
    document.body.appendChild(toast);

    // Now that modal is in DOM, safely select elements
    const modal = document.getElementById("quoteModal");
    const openBtn = document.querySelector('[data-toggle="quote-modal"]'); // Use data attribute for flexibility
    const closeBtn = modal?.querySelector("#closeModal");

    if (openBtn && modal) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  } catch (err) {
    console.error(" Failed to load quote modal:", err);
  }
}
