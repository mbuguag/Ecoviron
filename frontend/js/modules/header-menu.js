// // modules/header-menu.js
// export function initHeaderMenu() {
//   const menuToggle = document.querySelector(".header-menu-toggle");
//   const menuOverlay = document.querySelector(".menu-overlay");
//   const nav = document.querySelector(".header-nav");

//   if (!menuToggle || !menuOverlay || !nav) return;

//   function toggleMenu() {
//     const isOpen = nav.classList.toggle("nav-open");
//     menuOverlay.classList.toggle("active", isOpen);
//     menuToggle.setAttribute("aria-expanded", isOpen);
//     document.body.classList.toggle("no-scroll", isOpen);
//   }

//   // Toggle menu on hamburger click
//   menuToggle.addEventListener("click", toggleMenu);

//   // Close menu when clicking overlay
//   menuOverlay.addEventListener("click", () => {
//     nav.classList.remove("nav-open");
//     menuOverlay.classList.remove("active");
//     menuToggle.setAttribute("aria-expanded", "false");
//     document.body.classList.remove("no-scroll");
//   });

//   // Close menu with ESC key
//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape" && nav.classList.contains("nav-open")) {
//       nav.classList.remove("nav-open");
//       menuOverlay.classList.remove("active");
//       menuToggle.setAttribute("aria-expanded", "false");
//       document.body.classList.remove("no-scroll");
//     }
//   });

//   console.log("Header menu initialized ✅");
// }
