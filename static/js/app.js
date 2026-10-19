/**
 * Scholarship Application Assistant — Client Script
 * Provides UI enhancements, loading state management, and accessible validation feedback.
 * Note: Server-side validation in Python is authoritative.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form submission loading state
    const eligibilityForm = document.getElementById('eligibilityForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnSpinner = document.getElementById('btnSpinner');

    if (eligibilityForm && submitBtn) {
        eligibilityForm.addEventListener('submit', () => {
            if (btnSpinner) {
                btnSpinner.classList.remove('hidden');
            }
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.85';
            submitBtn.style.cursor = 'wait';
        });
    }

    // Chat form submission loading state
    const chatForm = document.getElementById('chatForm');
    const askBtn = document.getElementById('askBtn');
    const askSpinner = document.getElementById('askSpinner');

    if (chatForm && askBtn) {
        chatForm.addEventListener('submit', () => {
            if (askSpinner) {
                askSpinner.classList.remove('hidden');
            }
            askBtn.disabled = true;
            askBtn.style.opacity = '0.85';
            askBtn.style.cursor = 'wait';
        });
    }

    // Auto-focus first input on index page if empty
    const firstInput = document.getElementById('academic_percentage');
    if (firstInput && !firstInput.value) {
        firstInput.focus();
    }
});
