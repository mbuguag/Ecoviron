export async function loadQuoteModal() {
  try {
    const modalContainer = document.createElement("div");
    const response = await fetch("/frontend//quote-modal.html"); // adjust path as needed
    const html = await response.text();
    modalContainer.innerHTML = html;
    document.body.appendChild(modalContainer);

    // Toggle functionality
    const openBtn = document.getElementById("openQuoteModal");
    const closeBtn = document.getElementById("closeModal");
    const modal = document.getElementById("quoteModal");

    if (openBtn && modal) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    // Optional: click outside to close
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  } catch (err) {
    console.error(" Failed to load quote modal:", err);
  }
}
