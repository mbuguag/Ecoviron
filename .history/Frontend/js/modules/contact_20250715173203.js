export function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const responseDiv = document.getElementById("formResponse");
    
    try {
      const response = await fetch("http://localhost:8080/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.value,
          email: form.email.value,
          phone: form.phone.value,
          message: form.message.value
        })
      });

      if (response.ok) {
        responseDiv.textContent = `Thank you, ${form.name.value}. We've received your message!`;
        responseDiv.style.color = "green";
        form.reset();
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      responseDiv.textContent = `Error: ${error.message}`;
      responseDiv.style.color = "red";
    }
  });
}