import { mergeGuestCartWithServer } from "./guestCartMerge.js"; // ✅ make sure this path is correct

export function handleLogin(formId, endpoint) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Logging in...";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.value,
          password: form.password.value,
        }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userRole", data.role);

      
      await mergeGuestCartWithServer();

      
      window.location.href =
        data.role === "ADMIN"
          ? "../admin/admin-dashboard.html"
          : "../index.html";
    } catch (err) {
      alert(err.message);
    } finally {
      button.disabled = false;
      button.textContent = "Login";
    }
  });
}

export function handleRegister(formId, endpoint) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Registering...";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.name.value,
        email: form.email.value,
        password: form.password.value,
      }),
    })
      .then((res) => res.text())
      .then((msg) => {
        alert(msg);
        window.location.href = "login.html";
      })
      .finally(() => {
        button.disabled = false;
        button.textContent = "Register";
      });
  });
}
