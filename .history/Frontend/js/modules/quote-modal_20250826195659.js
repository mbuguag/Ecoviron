// quote-modal.js
import { API_BASE_URL, STATIC_BASE_URL } from "../apiConfig.";

export async function loadQuoteModal() {
  try {
    // Prevent re-initializing
    if (document.getElementById("quoteModal")) return;

    // Load modal HTML with fallback
    const modalContainer = document.createElement("div");
    modalContainer.id = "quote-modal-wrapper";

    let html = null;
    try {
      // Try STATIC_BASE_URL first
      const response = await fetch(`${STATIC_BASE_URL}/services/quote-modal.html`, {
        cache: "no-store"
      });
      if (!response.ok) throw new Error(`Failed with ${response.status}`);
      html = await response.text();
      console.log("✅ Loaded quote-modal.html from STATIC_BASE_URL");
    } catch (err) {
      console.warn("⚠️ Falling back to /frontend/services/quote-modal.html:", err.message);
      const fallbackRes = await fetch("/frontend/services/quote-modal.html", {
        cache: "no-store"
      });
      if (!fallbackRes.ok) throw new Error(`Fallback failed with ${fallbackRes.status}`);
      html = await fallbackRes.text();
    }

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

    // Open modal
    function openModal() {
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // lock scroll
    }

    // Close modal
    function closeModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.style.removeProperty("overflow"); // safer than ""
}


    // Open button
    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      });
    }

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "flex") {
        closeModal();
      }
    });

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

        // Loading UI
        const submitButton = form.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {
          // ✅ Use API_BASE_URL instead of hardcoded localhost
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
