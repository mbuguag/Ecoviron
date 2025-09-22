export async function loadQuoteModal() {
  try {
    // Prevent re-initializing
    if (document.getElementById("quoteModal")) return;

    // Load modal HTML
    const modalContainer = document.createElement("div");
    modalContainer.id = "quote-modal-wrapper";

    const response = await fetch("frontend/services/quote-modal.html");
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
      document.body.style.overflow = ""; // unlock scroll
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
          const res = await fetch("http://localhost:8080/api/quote/request", {
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
