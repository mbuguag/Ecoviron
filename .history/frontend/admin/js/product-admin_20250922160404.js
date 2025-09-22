// products.js
import { API_ENDPOINTS, STATIC_BASE_URL, authFetch } from "./apiconfig.js";

export function loadProducts() {
  authFetch(API_ENDPOINTS.products)
    .then((res) => res.json())
    .then((products) => {
      const tbody = document.querySelector("#productTable tbody");
      if (!tbody) return;
      tbody.innerHTML = "";

      products.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.description}</td>
          <td>${product.price ? "KES " + product.price.toFixed(2) : "N/A"}</td>
          <td>${product.category?.name || "N/A"}</td>
          <td>
            <img src="${STATIC_BASE_URL}${product.imageUrl}" width="50" alt="${product.name}"/>
          </td>
          <td>
            <button class="edit-btn" data-id="${product.id}">Edit</button>
            <button onclick="deleteProduct(${product.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      document.querySelectorAll(".edit-btn").forEach((btn) =>
        btn.addEventListener("click", () =>
          loadProductForEdit(btn.dataset.id)
        )
      );
    })
    .catch((err) => {
      console.error("Failed to load products:", err);
      alert("Error loading products. Please try again.");
    });
}

export function saveProduct() {
  const form = document.getElementById("productForm");
  const formData = new FormData(form);

  const imageInput = document.getElementById("productImage");
  const imageFile = imageInput.files[0];
  if (!imageFile) {
    alert("Please select an image file");
    return;
  }

  formData.set("image", imageFile);
  formData.set("featured", document.getElementById("productFeatured").checked);

  authFetch(`${API_ENDPOINTS.products}/upload`, {
    method: "POST",
    body: formData, // authFetch will skip JSON headers since it's FormData
  })
    .then((res) => {
      if (!res.ok) throw new Error("Product upload failed");
      return res.json();
    })
    .then(() => {
      alert("Product saved successfully");
      form.reset();
      loadProducts();
    })
    .catch((err) => alert("Error: " + err.message));
}

export function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    authFetch(`${API_ENDPOINTS.products}/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        loadProducts();
      })
      .catch((err) => alert("Delete failed: " + err.message));
  }
}

function loadProductForEdit(id) {
  authFetch(`${API_ENDPOINTS.products}/${id}`)
    .then((res) => res.json())
    .then((product) => {
      document.getElementById("productId").value = product.id;
      document.getElementById("productName").value = product.name;
      document.getElementById("productDescription").value = product.description;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productStock").value = product.stock || 0;
      document.getElementById("productFeatured").checked = product.featured;
      document.getElementById("productCategoryId").value =
        product.category?.id || "";
      alert("Editing mode loaded — replace image to update");
    })
    .catch((err) => {
      console.error("Failed to load product:", err);
      alert("Error loading product for edit.");
    });
}

// Optional: clear form
window.resetForm = function () {
  document.getElementById("productForm").reset();
};

window.deleteProduct = deleteProduct;
