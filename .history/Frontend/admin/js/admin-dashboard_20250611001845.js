document.addEventListener("DOMContentLoaded", () => {
const token = localStorage.getItem("token");

fetch("http://localhost:8080/api/users", {
headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(users => {
document.getElementById("total-users").textContent = users.length;
});

fetch("http://localhost:8080/api/products", {
headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(products => {
document.getElementById("total-products").textContent = products.length;
});

fetch("http://localhost:8080/api/orders", {
headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(orders => {
document.getElementById("total-orders").textContent = orders.length;
const revenue = orders.reduce((total, order) => total + order.totalAmount, 0);
document.getElementById("total-revenue").textContent = `KES ${revenue.toFixed(2)}`;
});
});