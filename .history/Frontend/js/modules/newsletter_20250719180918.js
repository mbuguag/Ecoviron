export function initNewsletter() {
  const form = document.querySelector("#newsletter-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector("input[type='email']");
    const email = emailInput.value.trim();
    const feedback = form.querySelector(".newsletter-feedback");

    // Clear previous messages
    feedback.textContent = "";
    feedback.classList.remove("success", "error");

    if (!email || !validateEmail(email)) {
      feedback.textContent = "Please enter a valid email address.";
      feedback.classList.add("error");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/newsletter/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        feedback.textContent = "Thanks for subscribing!";
        feedback.classList.add("success");
        form.reset();
      } else {
        const data = await response.json();
        feedback.textContent =
          data.message || "Subscription failed. Try again.";
        feedback.classList.add("error");
      }
    } catch (err) {
      console.error("Newsletter error:", err);
      feedback.textContent = "An error occurred. Please try again later.";
      feedback.classList.add("error");
    }
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
