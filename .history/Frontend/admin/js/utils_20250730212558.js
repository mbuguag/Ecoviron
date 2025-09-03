export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Handle unauthorized responses
    if (res.status === 401 || res.status === 403) {
      console.warn(`Access denied (${res.status}) to: ${url}`);
      throw new Error(`Unauthorized (status ${res.status})`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    } else {
      throw new Error("Expected JSON response but got something else");
    }
  } catch (err) {
    console.error("authFetch error:", err.message);
    throw err;
  }
}
