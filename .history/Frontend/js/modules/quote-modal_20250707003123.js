export async function loadQuoteModal() {
  try {
    // Avoid duplicate modals on multiple calls
    if (document.getElementById("quoteModal")) return;

    const modalContainer = document.createElement("div");
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

    // Click outside modal to close
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    function closeModal() {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }

    // Handle form submit
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
          name: form.name?.value.trim() || "",
          email: form.email?.value.trim() || "",
          service: form.service?.value.trim() || "",
          message: form.message?.value.trim() || "",
        };

        // Optional validation
        if (!formData.name || !formData.email || !formData.message) {
          showToast("Please fill in all required fields.");
          return;
        }

        try {
          const res = await fetch("/api/quote/request", {
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
