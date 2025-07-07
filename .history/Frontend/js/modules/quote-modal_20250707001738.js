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

    const modal = document.getElementById("quoteModal");
    const openBtn = document.querySelector('[data-toggle="quote-modal"]');
    const closeBtn = modal?.querySelector("#closeModal");
    const form = modal?.querySelector("#quoteForm");

    
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

    // Close modal on outside click
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Submit form logic
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          service: form.service.value.trim(),
          message: form.message.value.trim(),
        };

        try {
          const res = await fetch("/api/quote/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          if (res.ok) {
            showToast("Quote request sent successfully!");
            form.reset();
            modal.style.display = "none";
          } else {
            showToast("Failed to send request. Try again.");
          }
        } catch (error) {
          console.error("Error submitting quote request:", error);
          showToast("An error occurred. Please try again later.");
        }
      });
    }
  } catch (err) {
    console.error("Failed to load quote modal:", err);
  }

  // Toast function
  function showToast(message = "Request sent successfully!") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hidden");
    }, 3000);
  }
}
