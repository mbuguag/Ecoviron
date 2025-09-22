// import { API_BASE, authFetch } from "./dashboard.js";

// export function loadProducts() {
//   authFetch(API_BASE.products)
//     .then((res) => res.json())
//     .then((products) => {
//       const tbody = document.querySelector("#productTable tbody");
//       if (!tbody) return;
//       tbody.innerHTML = "";

//       products.forEach((product) => {
//         const row = document.createElement("tr");
//         row.innerHTML = `
//           <td>${product.name}</td>
//           <td>${product.description}</td>
//           <td>$${product.price.toFixed(2)}</td>
//           <td>${product.category?.name || "N/A"}</td>
//           <td><img src="${API_BASE.publicProducts.replace(
//             "/api/products",
//             ""
//           )}${product.imageUrl}" width="50"/></td>
//           <td>
//             <button class="edit-btn" data-id="${product.id}">Edit</button>
//             <button onclick="deleteProduct(${product.id})">Delete</button>
//           </td>
//         `;
//         tbody.appendChild(row);
//       });

//       document
//         .querySelectorAll(".edit-btn")
//         .forEach((btn) =>
//           btn.addEventListener("click", () =>
//             loadProductForEdit(btn.dataset.id)
//           )
//         );
//     });
// }

// export function saveProduct() {
//   const form = document.getElementById("productForm");
//   const formData = new FormData(form);

//   const imageInput = document.getElementById("productImage");
//   const imageFile = imageInput.files[0];
//   if (!imageFile) {
//     alert("Please select an image file");
//     return;
//   }

//   formData.set("image", imageFile);
//   formData.set("featured", document.getElementById("productFeatured").checked);

//   fetch(`${API_BASE.products}/upload`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//     body: formData,
//   })
//     .then((res) => {
//       if (!res.ok) throw new Error("Product upload failed");
//       return res.json();
//     })
//     .then(() => {
//       alert("Product saved successfully");
//       form.reset();
//       loadProducts();
//     })
//     .catch((err) => alert("Error: " + err.message));
// }

// export function deleteProduct(id) {
//   if (confirm("Delete this product?")) {
//     authFetch(`${API_BASE.products}/${id}`, { method: "DELETE" })
//       .then(() => loadProducts())
//       .catch((err) => alert("Delete failed: " + err.message));
//   }
// }

// function loadProductForEdit(id) {
//   authFetch(`${API_BASE.products}/${id}`)
//     .then((res) => res.json())
//     .then((product) => {
//       document.getElementById("productId").value = product.id;
//       document.getElementById("productName").value = product.name;
//       document.getElementById("productDescription").value = product.description;
//       document.getElementById("productPrice").value = product.price;
//       document.getElementById("productStock").value = product.stock || 0;
//       document.getElementById("productFeatured").checked = product.featured;
//       document.getElementById("productCategoryId").value =
//         product.category?.id || "";
//       alert("Editing mode loaded — replace image to update");
//     });
// }

// // Optional: clear form
// window.resetForm = function () {
//   document.getElementById("productForm").reset();
// };

// window.deleteProduct = deleteProduct;
