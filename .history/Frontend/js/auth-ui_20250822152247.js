// form-handlers.js - Optimized form handling
import { authService } from './auth.js';

export class FormHandlers {
  static async handleLogin(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const button = form.querySelector('button');
      const originalText = button.textContent;
      
      try {
        button.disabled = true;
        button.textContent = 'Logging in...';

        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        const redirectPath = await authService.login(email, password);
        window.location.href = redirectPath;

      } catch (error) {
        this.showError(error.message);
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  static async handleRegister(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const button = form.querySelector('button');
      const originalText = button.textContent;
      
      try {
        button.disabled = true;
        button.textContent = 'Registering...';

        const formData = new FormData(form);
        const redirectPath = await authService.register(formData);
        
        window.location.href = redirectPath;

      } catch (error) {
        this.showError(error.message);
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  static showError(message) {
    // Create or update error display
    let errorDiv = document.getElementById('form-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'form-error';
      errorDiv.className = 'form-error';
      document.querySelector('form').prepend(errorDiv);
    }

    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }
}