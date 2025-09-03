export function initBreadcrumbs() {
  const breadcrumbContainer = document.querySelector(".breadcrumb-container");
  if (!breadcrumbContainer) return;

  const pathArray = window.location.pathname.split("/").filter(Boolean);
  let breadcrumbHTML = '<nav class="breadcrumb" aria-label="Breadcrumb"><ol>';

  // Always start with Home
  breadcrumbHTML += '<li><a href="/"><i class="fas fa-home"></i> Home</a></li>';

  let cumulativePath = "";

  pathArray.forEach((segment, index) => {
    const isLast = index === pathArray.length - 1;
    segment = segment.replace(".html", "").replace(/-/g, " ");
    cumulativePath += `/${pathArray[index]}`;

    if (isLast) {
      breadcrumbHTML += `<li aria-current="page">${segment}</li>`;
    } else {
      breadcrumbHTML += `<li><a href="${cumulativePath}">${segment}</a></li>`;
    }
  });

  breadcrumbHTML += "</ol></nav>";
  breadcrumbContainer.innerHTML = breadcrumbHTML;
}
