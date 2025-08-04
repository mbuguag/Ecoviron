export function initBreadcrumbs() {
  const breadcrumbContainer = document.querySelector(".breadcrumb-container");
  if (!breadcrumbContainer) return;

  const pathname = window.location.pathname;
  let breadcrumbHTML = '<nav class="breadcrumb" aria-label="Breadcrumb"><ol>';

  // Always start with Home
  breadcrumbHTML += '<li><a href="/"><i class="fas fa-home"></i> Home</a></li>';

  // Custom breadcrumb paths for specific pages
  if (pathname.includes("about.html") || pathname.endsWith("/about")) {
    breadcrumbHTML += '<li aria-current="page">About Us</li>';
  }
  // Add more custom paths as needed for other pages
  else if (pathname.includes("services/")) {
    const serviceName = pathname
      .split("/")
      .pop()
      .replace(".html", "")
      .replace(/-/g, " ");
    breadcrumbHTML += '<li><a href="/services/">Services</a></li>';
    breadcrumbHTML += `<li aria-current="page">${serviceName}</li>`;
  }
  // Default behavior for other pages
  else {
    const pathArray = pathname
      .split("/")
      .filter((segment) => segment && !segment.endsWith(".html"));
    pathArray.forEach((segment, index) => {
      const isLast = index === pathArray.length - 1;
      segment = segment.replace(/-/g, " ");

      if (isLast) {
        breadcrumbHTML += `<li aria-current="page">${segment}</li>`;
      } else {
        breadcrumbHTML += `<li><a href="/${pathArray
          .slice(0, index + 1)
          .join("/")}/">${segment}</a></li>`;
      }
    });
  }

  breadcrumbHTML += "</ol></nav>";
  breadcrumbContainer.innerHTML = breadcrumbHTML;
}
