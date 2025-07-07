export function formatPrice(amount) {
  return `KES ${amount.toLocaleString()}`;
}

export function loadComponent(url, containerId) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = html;
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}