const API_URL = "http://localhost:8080/api/contact/admin";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(API_URL, {
      headers: {
        // Include token if endpoint is secured
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"), // Optional
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch contact messages");
    }

    const messages = await response.json();
    populateTable(messages);
  } catch (error) {
    console.error("Error loading messages:", error);
    document.getElementById(
      "contactMessagesBody"
    ).innerHTML = `<tr><td colspan="6" style="color:red;">Failed to load messages.</td></tr>`;
  }
});

function populateTable(messages) {
  const tbody = document.getElementById("contactMessagesBody");
  tbody.innerHTML = "";

  messages.forEach((msg) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${msg.id}</td>
      <td>${msg.name}</td>
      <td>${msg.email}</td>
      <td>${msg.phone || "-"}</td>
      <td>${msg.message}</td>
      <td>${new Date(msg.submittedAt).toLocaleString()}</td>
    `;

    tbody.appendChild(row);
  });
}
