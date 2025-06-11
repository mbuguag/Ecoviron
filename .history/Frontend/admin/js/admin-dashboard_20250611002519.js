document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No authentication token found");
        return;
    }

    // Fetch users with error handling
    fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
    })
    .then(users => {
        document.getElementById("total-users").textContent = users.length;
    })
    .catch(err => {
        console.error("Error fetching users:", err);
        document.getElementById("total-users").textContent = "N/A";
    });

    // Fetch products with error handling
    fetch("http://localhost:8080/api/products", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
    })
    .then(products => {
        document.getElementById("total-products").textContent = products.length;
    })
    .catch(err => {
        console.error("Error fetching products:", err);
        document.getElementById("total-products").textContent = "N/A";
    });

    // Fetch orders with error handling
    fetch("http://localhost:8080/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
    })
    .then(orders => {
        document.getElementById("total-orders").textContent = orders.length;
        const revenue = orders.reduce((total, order) => total + order.totalAmount, 0);
        document.getElementById("total-revenue").textContent = `KES ${revenue.toFixed(2)}`;
    })
    .catch(err => {
        console.error("Error fetching orders:", err);
        document.getElementById("total-orders").textContent = "N/A";
        document.getElementById("total-revenue").textContent = "KES 0.00";
    });
});