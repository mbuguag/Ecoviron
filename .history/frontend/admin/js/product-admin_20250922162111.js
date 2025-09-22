// products.js
import { API_ENDPOINTS, fetchJson, authFetch } from "./apiConfig.js";

/**
 * Load and display products in the admin table
 */
export async function loadProducts() {
  try {
    const products = await fetchJson(API_ENDPOINTS.products);
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
          <img src="${product.imageUrl}" width="50" alt="${product.name}"/>
        </td>
        <td>
          <button class="edit-btn" data-id="${product.id}">Edit</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Attach edit event listeners
    document.querySelectorAll(".edit-btn").forEach((btn) =>
      btn.addEventListener("click", () =>
        loadProductForEdit(btn.dataset.id)
      )
    );
  } catch (err) {
    console.error("Failed to load products:", err);
    alert("Error loading products. Please try again.");
  }
}

/**
 * Save or update a product (handles new + existing image)
 */
export async function saveProduct() {
  const form = document.getElementById("productForm");
  const formData = new FormData(form);

  const productId = document.getElementById("productId").value;
  const imageInput = document.getElementById("productImage");
  const imageFile = imageInput.files[0];

  if (imageFile) {
    formData.set("image", imageFile);
  } else {
    // Keep existing image if editing without replacing
    const existingUrl = document.getElementById("existingImageUrl")?.value;
    if (existingUrl) {
      formData.set("existingImageUrl", existingUrl);
    }
  }

  formData.set("featured", document.getElementById("productFeatured").checked);

  try {
    const endpoint = productId
      ? `${API_ENDPOINTS.admin.products}/${productId}`
      : `${API_ENDPOINTS.products}/upload`;

    const method = productId ? "PUT" : "POST";

    const res = await authFetch(endpoint, {
      method,
      body: formData,
    });

    if (!res.ok) throw new Error("Product save failed");

    await res.json();
    alert("✅ Product saved successfully");
    form.reset();
    loadProducts();
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try {
    const res = await authFetch(`${API_ENDPOINTS.products}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
    loadProducts();
  } catch (err) {
    alert("❌ Delete failed: " + err.message);
  }
}

/**
 * Load product into form for editing
 */
async function loadProductForEdit(id) {
  try {
    const product = await fetchJson(`${API_ENDPOINTS.admin.products}/${id}`);

    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock || 0;
    document.getElementById("productFeatured").checked = product.featured;
    document.getElementById("productCategoryId").value =
      product.category?.id || "";

    // Store existing image URL for later if user doesn't upload a new one
    let hiddenInput = document.getElementById("existingImageUrl");
    if (!hiddenInput) {
      hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.id = "existingImageUrl";
      hiddenInput.name = "existingImageUrl";
      form.appendChild(hiddenInput);
    }
    hiddenInput.value = product.imageUrl;

    alert("✏️ Editing mode loaded — upload a new image to replace, or leave blank to keep existing.");
  } catch (err) {
    console.error("Failed to load product:", err);
    alert("❌ Error loading product for edit.");
  }
}

/**
 * Optional: clear form
 */
window.resetForm = function () {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  const hiddenInput = document.getElementById("existingImageUrl");
  if (hiddenInput) hiddenInput.remove();
};

// Expose deleteProduct globally for inline onclick
window.deleteProduct = deleteProduct;
