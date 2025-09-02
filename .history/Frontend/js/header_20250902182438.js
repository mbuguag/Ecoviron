// header.js
import { BASE_PATH } from "../apiConfig.js";
import { renderAuthUI } from "./auth-ui.js";

class HeaderManager {
  constructor() {
    this.mobileMenuToggle = document.getElementById("mobileMenuToggle");
    this.mobileNav = document.getElementById("mobileNav");
    this.authArea = document.getElementById("authArea");
    this.authAreaMobile = document.getElementById("authAreaMobile");
  }

  init() {
    this.bindEvents();
    this.initAuthUI();
  }

  bindEvents() {
    if (this.mobileMenuToggle && this.mobileNav) {
      this.mobileMenuToggle.addEventListener("click", () => {
        this.mobileNav.classList.toggle("open");
      });
    }
  }

  initAuthUI() {
    if (this.authArea) {
      renderAuthUI(this.authArea);
    }
    if (this.authAreaMobile) {
      renderAuthUI(this.authAreaMobile, true);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const headerManager = new HeaderManager();
  headerManager.init();
});
