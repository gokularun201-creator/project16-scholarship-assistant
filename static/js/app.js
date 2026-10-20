/**
 * Scholarship Application Assistant — Client Script
 * Features:
 * - Dark/Light mode theme switching with localStorage persistence
 * - Quick-preset profile population for testing
 * - Interactive real-time criteria threshold hints
 * - Copy-to-clipboard for RAG answers
 * - Loading spinner handling for form submissions
 * Note: Server-side Python evaluation remains authoritative.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Dark Mode / Theme Toggle
    // -------------------------------------------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('scholarship_theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('scholarship_theme', targetTheme);
        });
    }

    // -------------------------------------------------------------------------
    // 2. Preset Buttons: Quick Profile Auto-Fill
    // -------------------------------------------------------------------------
    const presetButtons = document.querySelectorAll('.preset-btn');
    const acadInput = document.getElementById('academic_percentage');
    const attInput = document.getElementById('attendance_percentage');
    const incInput = document.getElementById('annual_family_income');

    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const acad = btn.getAttribute('data-acad');
            const att = btn.getAttribute('data-att');
            const inc = btn.getAttribute('data-inc');

            if (acadInput) acadInput.value = acad;
            if (attInput) attInput.value = att;
            if (incInput) incInput.value = inc;

            updateThresholdHints();

            // Subtle highlight flash on inputs
            [acadInput, attInput, incInput].forEach(inp => {
                if (inp) {
                    inp.style.transition = 'background-color 0.3s ease';
                    inp.style.backgroundColor = 'var(--color-primary-subtle)';
                    setTimeout(() => {
                        inp.style.backgroundColor = '';
                    }, 400);
                }
            });
        });
    });

    // -------------------------------------------------------------------------
    // 3. Live Threshold Indicators
    // -------------------------------------------------------------------------
    const hintAcadMerit = document.getElementById('hintAcadMerit');
    const hintAcadAccess = document.getElementById('hintAcadAccess');
    const hintAttMerit = document.getElementById('hintAttMerit');
    const hintAttAccess = document.getElementById('hintAttAccess');
    const hintIncAccess = document.getElementById('hintIncAccess');

    function updateThresholdHints() {
        if (!acadInput || !attInput || !incInput) return;

        const acadVal = parseFloat(acadInput.value);
        const attVal = parseFloat(attInput.value);
        const incVal = parseFloat(incInput.value);

        // Academic Hints
        if (hintAcadMerit) {
            hintAcadMerit.classList.toggle('active-pass', !isNaN(acadVal) && acadVal >= 85 && acadVal <= 100);
        }
        if (hintAcadAccess) {
            hintAcadAccess.classList.toggle('active-pass', !isNaN(acadVal) && acadVal >= 60 && acadVal <= 100);
        }

        // Attendance Hints
        if (hintAttMerit) {
            hintAttMerit.classList.toggle('active-pass', !isNaN(attVal) && attVal >= 90 && attVal <= 100);
        }
        if (hintAttAccess) {
            hintAttAccess.classList.toggle('active-pass', !isNaN(attVal) && attVal >= 75 && attVal <= 100);
        }

        // Income Hints
        if (hintIncAccess) {
            hintIncAccess.classList.toggle('active-pass', !isNaN(incVal) && incVal >= 0 && incVal <= 250000);
        }
    }

    if (acadInput) acadInput.addEventListener('input', updateThresholdHints);
    if (attInput) attInput.addEventListener('input', updateThresholdHints);
    if (incInput) incInput.addEventListener('input', updateThresholdHints);

    // Initial check on page load if inputs have values
    updateThresholdHints();

    // -------------------------------------------------------------------------
    // 4. Form Loading Spinner Management
    // -------------------------------------------------------------------------
    const eligibilityForm = document.getElementById('eligibilityForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnSpinner = document.getElementById('btnSpinner');

    if (eligibilityForm && submitBtn) {
        eligibilityForm.addEventListener('submit', () => {
            if (btnSpinner) btnSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.85';
            submitBtn.style.cursor = 'wait';
        });
    }

    const chatForm = document.getElementById('chatForm');
    const askBtn = document.getElementById('askBtn');
    const askSpinner = document.getElementById('askSpinner');

    if (chatForm && askBtn) {
        chatForm.addEventListener('submit', () => {
            if (askSpinner) askSpinner.classList.remove('hidden');
            askBtn.disabled = true;
            askBtn.style.opacity = '0.85';
            askBtn.style.cursor = 'wait';
        });
    }

    // -------------------------------------------------------------------------
    // 5. Copy Answer to Clipboard
    // -------------------------------------------------------------------------
    const copyBtn = document.getElementById('copyBtn');
    const answerText = document.getElementById('answerText');

    if (copyBtn && answerText) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = answerText.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const copyLabel = copyBtn.querySelector('.copy-label');
                if (copyLabel) {
                    const originalText = copyLabel.innerText;
                    copyLabel.innerText = 'Copied!';
                    copyBtn.style.borderColor = 'var(--color-success)';
                    copyBtn.style.color = 'var(--color-success)';
                    setTimeout(() => {
                        copyLabel.innerText = originalText;
                        copyBtn.style.borderColor = '';
                        copyBtn.style.color = '';
                    }, 2000);
                }
            }).catch(() => {
                // Clipboard fallback
            });
        });
    }
});
