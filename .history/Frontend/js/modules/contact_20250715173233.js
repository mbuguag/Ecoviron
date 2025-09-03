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
          name: form.elements["name"].value,
          email: form.elements["email"].value,
          phone: form.elements["phone"].value,
          message: form.elements["message"].value,
        }),
      });

      if (response.ok) {
        responseDiv.textContent = `Thank you, ${form.elements["name"].value}. We've received your message!`;

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