
// Detect project root automatically
(function () {
  let path = window.location.pathname;

  // If running locally with subfolders, adjust accordingly
  let projectRoot = "/";
  if (path.includes("/frontend/")) {
    projectRoot = path.substring(0, path.indexOf("/frontend/") + 1);
  } else if (path.includes("/public/")) {
    projectRoot = path.substring(0, path.indexOf("/public/") + 1);
  }

  window.BASE_PATH = projectRoot;
})();
