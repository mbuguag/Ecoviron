import { getCurrentUser, fetchCurrentUser } from "./auth.js";

export async function requireAuth(redirectTo = "/login.html") {
  let user = getCurrentUser();

  // Try backend if not in localStorage
  if (!user) {
    user = await fetchCurrentUser();
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  if (!user) {
    window.location.href = redirectTo;
    return null;
  }

  return user;
}
