
import { API_BASE, authFetch, BACKEND_URL } from "../js/dashboard.js";

export function loadProducts() {
  authFetch(API_BASE.products)
    .then((res) => res.json())
    .then((products) => {
      const tbody = document.querySelector("#productTable tbody");
      if (!tbody) return;

      tbody.innerHTML = "";
      products.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.price}</td>
          <td><img src="${BACKEND_URL}${product.imageUrl}" width="50"/></td>
          <td>
            <button class="edit-btn" data-id="${product.id}">Edit</button>
            <button onclick="deleteProduct(${product.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    });
}

export function saveProduct() {
  const form = document.getElementById("productForm");
  const formData = new FormData(form);

  authFetch(API_BASE.products, {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save product");
      return res.json();
    })
    .then(() => {
      form.reset();
      loadProducts();
    })
    .catch((err) => alert(err.message));
}

export function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    authFetch(`${API_BASE.products}/${id}`, { method: "DELETE" })
      .then(() => loadProducts())
      .catch((err) => alert("Delete failed: " + err.message));
  }
}

// For global scope access in inline HTML onclick
window.deleteProduct = deleteProduct;
