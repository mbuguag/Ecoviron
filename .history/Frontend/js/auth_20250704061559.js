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

export function handleRegister(formId, endpoint) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Registering...";

    const formData = new FormData();
    formData.append("fullName", form.fullName.value);
    formData.append("email", form.email.value);
    formData.append("password", form.password.value);

    const imageFile = form.querySelector('input[type="file"]')?.files?.[0];
    if (imageFile) {
      formData.append("profilePic", imageFile);
    }

    fetch(endpoint, {
      method: "POST",
      body: formData,
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
  const token = localStorage.getItem("jwtToken") || localStorage.getItem("jwtToken");
  return !!token;
}

