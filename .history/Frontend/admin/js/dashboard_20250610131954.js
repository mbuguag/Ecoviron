function showSection(sectionId) {
  const sections = document.querySelectorAll(".admin-section");
  sections.forEach(section => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });
}

const API_BASE = "/api/products"; // Adjust if your endpoint is different

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveProduct();
  });
});

function loadProducts() {
  fetch(API_BASE)
    .then(res => res.json())
    .then(products => {
      const table = document.querySelector("#productTable tbody");
      table.innerHTML = "";

      products.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${p.name}</td>
          <td>${p.description}</td>
          <td>${p.price}</td>
          <td>${p.category}</td>
          <td><img src="${p.imageUrl}" width="50"/></td>
          <td>
            <button onclick="editProduct(${p.id})">Edit</button>
            <button onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        `;
        table.appendChild(row);
      });
    });
}

function saveProduct() {
  const product = {
    name: document.getElementById("productName").value,
    description: document.getElementById("productDescription").value,
    price: parseFloat(document.getElementById("productPrice").value),
    imageUrl: document.getElementById("productImageUrl").value,
    category: document.getElementById("productCategory").value
  };

  const id = document.getElementById("productId").value;

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_BASE}/${id}` : API_BASE;

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  })
  .then(() => {
    resetForm();
    loadProducts();
  });
}

function editProduct(id) {
  fetch(`${API_BASE}/${id}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById("formTitle").textContent = "Edit Product";
      document.getElementById("productId").value = product.id;
      document.getElementById("productName").value = product.name;
      document.getElementById("productDescription").value = product.description;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productImageUrl").value = product.imageUrl;
      document.getElementById("productCategory").value = product.category;
    });
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    fetch(`${API_BASE}/${id}`, { method: "DELETE" })
      .then(() => loadProducts());
  }
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("formTitle").textContent = "Add Product";
}
?
document.addEventListener("DOMContentLoaded", function () {
  fetch('/api/admin/summary')
    .then(res => res.json())
    .then(data => {
      document.getElementById("total-orders").innerText = `Total Orders: ${data.totalOrders}`;
      document.getElementById("total-users").innerText = `Total Users: ${data.totalUsers}`;
      document.getElementById("total-products").innerText = `Total Products: ${data.totalProducts}`;

      const ctx = document.getElementById("orderChart").getContext("2d");
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pending', 'Shipped', 'Delivered'],
          datasets: [{
            label: 'Order Status',
            data: [
              data.orderStatus.pending,
              data.orderStatus.shipped,
              data.orderStatus.delivered
            ],
            backgroundColor: ['orange', 'blue', 'green']
          }]
        }
      });
    })
    .catch(err => {
      console.error("Failed to load dashboard data", err);
    });
});
