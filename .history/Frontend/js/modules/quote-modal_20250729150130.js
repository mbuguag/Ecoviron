export async function loadQuoteModal() {
  try {
    // Prevent re-initializing
    if (document.getElementById("quoteModal")) return;

    // Load modal HTML
    const modalContainer = document.createElement("div");
    modalContainer.id = "quote-modal-wrapper"; // Optional ID for debugging/styling

    const response = await fetch("/frontend/services/quote-modal.html");
    const html = await response.text();
    modalContainer.innerHTML = html;
    document.body.appendChild(modalContainer);

    // Toast setup
    let toastTimeout;
    const toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast hidden";
    document.body.appendChild(toast);

    const modal = document.getElementById("quoteModal");
    const openBtn = document.querySelector('[data-toggle="quote-modal"]');
    const closeBtn = modal?.querySelector("#closeModal");
    const form = modal?.querySelector("#quoteForm");

    if (!modal) return;

    // Open modal
    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
      });
    }

    // Close modal
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeModal();
      });
    }

    // Close if clicked outside
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    function closeModal() {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }

    // Handle submission
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
          name: form.name?.value.trim() || "",
          email: form.email?.value.trim() || "",
          service: form.service?.value.trim() || "",
          message: form.message?.value.trim() || "",
        };

        if (!formData.name || !formData.email || !formData.m) {
          showToast("Please fill in all required fields.");
          return;
        }

        try {
          const res = await fetch("http://localhost:8080/api/quote/request", {
            // ← FIXED URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          if (res.ok) {
            showToast("Quote request sent successfully!");
            form.reset();
            closeModal();
          } else {
            showToast("Failed to send request. Try again.");
          }
        } catch (error) {
          console.error("Error submitting quote request:", error);
          showToast("An error occurred. Please try again later.");
        }
      });
    }

    function showToast(message = "Request sent successfully!") {
      if (!toast) return;
      clearTimeout(toastTimeout);
      toast.textContent = message;
      toast.classList.remove("hidden");
      toast.classList.add("show");

      toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hidden");
      }, 3000);
    }
  } catch (err) {
    console.error("Failed to load quote modal:", err);
  }
}
