// quote-modal.js
import { API_BASE_URL } from "../js/apiConfig.js";

export async function loadQuoteModal() {
  try {
    // Prevent re-initializing
    if (document.getElementById("quoteModal")) return;

    // Load modal HTML
    const modalContainer = document.createElement("div");
    modalContainer.id = "quote-modal-wrapper";

    const response = await fetch("/frontend/services/quote-modal.html");
    const html = await response.text();
    modalContainer.innerHTML = html;
    document.body.appendChild(modalContainer);

    // Ensure single toast
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast hidden";
      document.body.appendChild(toast);
    }
    let toastTimeout;

    const modal = document.getElementById("quoteModal");
    const openBtn = document.querySelector('[data-toggle="quote-modal"]');
    const closeBtn = modal?.querySelector("#closeModal");
    const form = modal?.querySelector("#quoteForm");

    if (!modal) return;

    // ... openModal, closeModal, listeners unchanged ...

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

        if (!formData.name || !formData.email || !formData.service) {
          showToast("Please fill in all required fields.");
          return;
        }

        const submitButton = form.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
          // ✅ Use API_BASE_URL from apiConfig
          const res = await fetch(`${API_BASE_URL}/quote/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          if (res.ok) {
            showToast(
              "Quote request sent successfully! A confirmation has been sent to your email."
            );
            form.reset();
            closeModal();
          } else {
            showToast("Failed to send request. Please try again.");
          }
        } catch (error) {
          console.error("Error submitting quote request:", error);
          showToast("An error occurred. Please try again later.");
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = "Submit Request";
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
      }, 4000);
    }
  } catch (err) {
    console.error("Failed to load quote modal:", err);
  }
}
