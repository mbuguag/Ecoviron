await mergeGuestCartToBackend();

export function handleLogin(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Logging in...";

    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid credentials");
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("username", data.fullName || data.name || "User");
        localStorage.setItem("userEmail", data.email);

        await mergeGuestCartWithServer();
        
        if (data.profileImageUrl) {
          localStorage.setItem("profileImage", data.profileImageUrl);
        }

        window.location.href =
          data.role === "ADMIN"
            ? "../admin/admin-dashboard.html"
            : "../index.html";
      })
      .catch((err) => alert(err.message))
      .finally(() => {
        button.disabled = false;
        button.textContent = "Login";
      });
  });
}

export async function refreshToken() {
  //remember to implement cookie backend
  try {
    const res = await fetch("http://localhost:8080/api/auth/refresh", {
      method: "POST",
      credentials: "include", // must be HTTP-only cookie based
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("jwtToken", data.jwtToken);
      return true;
    }
  } catch (err) {
    console.error("Token refresh failed", err);
  }
  return false;
}

export function handleRegister(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Registering...";

    const body = {
      fullName: form.fullName.value,
      email: form.email.value,
      password: form.password.value,
    };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Registration failed");
        return res.text();
      })
      .then((msg) => {
        alert(msg);
        window.location.href = "login.html";
      })
      .catch((err) => alert(err.message))
      .finally(() => {
        button.disabled = false;
        button.textContent = "Register";
      });
  });
}

export function isLoggedIn() {
  const token =
    localStorage.getItem("jwtToken") || localStorage.getItem("jwtToken");
  return !!token;
}
