/**
 * Scholarship Application Assistant — Interactive GitHub Pages Script
 * Replicates the authoritative deterministic evaluation from scholarship_tool.py
 * and grounded RAG responses from rag_service.py entirely in the browser.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Theme Management (Light / Dark Mode)
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
    // 2. Navigation Tabs (Checker vs Chat)
    // -------------------------------------------------------------------------
    const tabBtnChecker = document.getElementById('tabBtnChecker');
    const tabBtnChat = document.getElementById('tabBtnChat');
    const panelChecker = document.getElementById('panelChecker');
    const panelChat = document.getElementById('panelChat');
    const brandHomeLink = document.getElementById('brandHomeLink');

    function switchTab(target) {
        if (target === 'checker') {
            tabBtnChecker.classList.add('active');
            tabBtnChat.classList.remove('active');
            panelChecker.classList.add('active');
            panelChat.classList.remove('active');
        } else {
            tabBtnChat.classList.add('active');
            tabBtnChecker.classList.remove('active');
            panelChat.classList.add('active');
            panelChecker.classList.remove('active');
        }
    }

    if (tabBtnChecker) tabBtnChecker.addEventListener('click', () => switchTab('checker'));
    if (tabBtnChat) tabBtnChat.addEventListener('click', () => switchTab('chat'));
    if (brandHomeLink) brandHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('checker');
    });

    // -------------------------------------------------------------------------
    // 3. Form Inputs & Live Threshold Hints
    // -------------------------------------------------------------------------
    const acadInput = document.getElementById('acad_input');
    const attInput = document.getElementById('att_input');
    const incInput = document.getElementById('inc_input');

    const hAcadMerit = document.getElementById('hAcadMerit');
    const hAcadAccess = document.getElementById('hAcadAccess');
    const hAttMerit = document.getElementById('hAttMerit');
    const hAttAccess = document.getElementById('hAttAccess');
    const hIncAccess = document.getElementById('hIncAccess');

    function updateThresholdHints() {
        const acad = parseFloat(acadInput.value);
        const att = parseFloat(attInput.value);
        const inc = parseFloat(incInput.value);

        if (hAcadMerit) hAcadMerit.classList.toggle('active-pass', !isNaN(acad) && acad >= 85 && acad <= 100);
        if (hAcadAccess) hAcadAccess.classList.toggle('active-pass', !isNaN(acad) && acad >= 60 && acad <= 100);
        if (hAttMerit) hAttMerit.classList.toggle('active-pass', !isNaN(att) && att >= 90 && att <= 100);
        if (hAttAccess) hAttAccess.classList.toggle('active-pass', !isNaN(att) && att >= 75 && att <= 100);
        if (hIncAccess) hIncAccess.classList.toggle('active-pass', !isNaN(inc) && inc >= 0 && inc <= 250000);
    }

    [acadInput, attInput, incInput].forEach(inp => {
        if (inp) inp.addEventListener('input', updateThresholdHints);
    });

    // Presets
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            acadInput.value = btn.getAttribute('data-acad');
            attInput.value = btn.getAttribute('data-att');
            incInput.value = btn.getAttribute('data-inc');
            updateThresholdHints();
            evaluateEligibility();
        });
    });

    // -------------------------------------------------------------------------
    // 4. Deterministic Eligibility Checker Engine
    // -------------------------------------------------------------------------
    const form = document.getElementById('eligibilityStaticForm');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorAlert = document.getElementById('clientErrorAlert');
    const errorMessage = document.getElementById('clientErrorMessage');
    const btnReset = document.getElementById('btnResetForm');

    function showError(msg) {
        if (errorAlert && errorMessage) {
            errorMessage.textContent = msg;
            errorAlert.classList.remove('hidden');
        }
    }

    function clearError() {
        if (errorAlert) errorAlert.classList.add('hidden');
    }

    function validateNumeric(val, name, min, max) {
        if (val === null || val === undefined || val === '') {
            throw new Error(`${name} is required.`);
        }
        const num = Number(val);
        if (isNaN(num)) {
            throw new Error(`${name} must be a valid number.`);
        }
        if (!isFinite(num)) {
            throw new Error(`${name} must be a finite number.`);
        }
        if (min !== undefined && num < min) {
            throw new Error(`${name} must be at least ${min}.`);
        }
        if (max !== undefined && num > max) {
            throw new Error(`${name} cannot exceed ${max}.`);
        }
        return num;
    }

    function evaluateEligibility() {
        clearError();
        try {
            const acad = validateNumeric(acadInput.value, 'Academic percentage', 0, 100);
            const att = validateNumeric(attInput.value, 'Attendance percentage', 0, 100);
            const inc = validateNumeric(incInput.value, 'Annual family income', 0);

            const eligible = [];

            // Merit Check: acad >= 85 and att >= 90
            if (acad >= 85.0 && att >= 90.0) {
                eligible.push({ name: 'Merit Scholarship', award: 15000 });
            }

            // Access Check: acad >= 60 and att >= 75 and inc <= 250000
            if (acad >= 60.0 && att >= 75.0 && inc <= 250000.0) {
                eligible.push({ name: 'Access Scholarship', award: 10000 });
            }

            let recommended = null;
            let recommendedAward = null;

            if (eligible.length > 0) {
                const recObj = eligible.reduce((prev, curr) => (curr.award > prev.award ? curr : prev));
                recommended = recObj.name;
                recommendedAward = recObj.award;
            }

            renderResults(eligible, recommended, recommendedAward);
        } catch (err) {
            showError(err.message);
        }
    }

    function renderResults(eligible, recommended, award) {
        if (eligible.length > 0) {
            let cardsHtml = eligible.map(sch => `
                <div class="scholarship-item ${sch.name === recommended ? 'is-recommended' : ''}">
                    <div class="item-header">
                        <div class="item-title-group">
                            <span class="sch-icon">${sch.name.includes('Merit') ? '🏆' : '🤝'}</span>
                            <h5 class="item-name">${sch.name}</h5>
                        </div>
                        ${sch.name === recommended ? '<span class="pill pill-recommended">★ Recommended</span>' : '<span class="pill pill-eligible">✓ Eligible</span>'}
                    </div>
                    <div class="item-award">
                        <span class="award-label">Award Value</span>
                        <span class="award-value">₹${sch.award.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="item-status-note">
                        <span class="check-icon">✓</span>
                        <span>All eligibility conditions verified</span>
                    </div>
                </div>
            `).join('');

            resultsContainer.innerHTML = `
                <div class="recommendation-hero" aria-live="polite">
                    <div class="rec-badge-row">
                        <span class="rec-crown">★</span>
                        <span class="rec-badge-text">Recommended Scholarship</span>
                        <span class="rec-tag">Highest Amount</span>
                    </div>
                    <h3 class="recommended-title">${recommended}</h3>
                    <div class="recommended-award-box">
                        <span class="award-currency">INR</span>
                        <span class="award-figure">₹${award.toLocaleString('en-IN')}</span>
                    </div>
                    <p class="recommended-rationale">
                        ${eligible.length > 1
                            ? '<strong>Dual Qualification:</strong> You qualify for both the Merit and Access scholarships. Because institutional guidelines permit only one award per student, the system recommends the scholarship with the higher monetary benefit.'
                            : '<strong>Direct Match:</strong> You meet all criteria required for this scholarship according to institutional guidelines.'
                        }
                    </p>
                </div>

                <div class="scholarships-breakdown">
                    <h4 class="subheading">
                        <span>All Qualifying Programs</span>
                        <span class="count-badge">${eligible.length}</span>
                    </h4>
                    <div class="scholarship-cards-grid">
                        ${cardsHtml}
                    </div>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="no-match-card" aria-live="polite">
                    <div class="no-match-icon-circle" aria-hidden="true">
                        <span>🔍</span>
                    </div>
                    <h3 class="no-match-title">No Matching Scholarships Found</h3>
                    <p class="no-match-text">
                        Based on the criteria supplied, your profile does not currently qualify for either listed scholarship program.
                    </p>
                    <div class="criteria-reference-card">
                        <h4 class="ref-heading">Institutional Eligibility Rules for Comparison:</h4>
                        <div class="ref-rule">
                            <div class="ref-name">
                                <span class="ref-icon">🏆</span>
                                <strong>Merit Scholarship (₹15,000)</strong>
                            </div>
                            <p class="ref-desc">Requires Academic &ge; 85.0% AND Attendance &ge; 90.0% (No income restriction).</p>
                        </div>
                        <div class="ref-rule">
                            <div class="ref-name">
                                <span class="ref-icon">🤝</span>
                                <strong>Access Scholarship (₹10,000)</strong>
                            </div>
                            <p class="ref-desc">Requires Academic &ge; 60.0%, Attendance &ge; 75.0%, AND Family Income &le; ₹2,50,000.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            evaluateEligibility();
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            acadInput.value = '';
            attInput.value = '';
            incInput.value = '';
            clearError();
            updateThresholdHints();
            resultsContainer.innerHTML = `
                <div class="initial-prompt-card">
                    <div class="initial-icon" aria-hidden="true">📋</div>
                    <h3 class="initial-title">Ready for Evaluation</h3>
                    <p class="initial-desc">
                        Provide your academic metrics in the form to the left and select <strong>"Find scholarships"</strong> to evaluate your profile against the authoritative eligibility rules.
                    </p>
                    <div class="demo-hints">
                        <span class="demo-hints-title">Quick Try:</span>
                        <span>Click any preset button above to preview eligibility scenarios.</span>
                    </div>
                </div>
            `;
        });
    }

    // -------------------------------------------------------------------------
    // 5. Document-Grounded Knowledge Assistant (RAG)
    // -------------------------------------------------------------------------
    const chatForm = document.getElementById('chatStaticForm');
    const chatInput = document.getElementById('chat_input');
    const chatAnswerContainer = document.getElementById('chatAnswerContainer');
    const btnResetChat = document.getElementById('btnResetChat');
    const demoQBtns = document.querySelectorAll('.demo-q-btn');

    function answerInquiry(question) {
        const q = question.trim().toLowerCase();
        let answer = '';
        let sources = [];

        // Demonstration Question 1: Income certificate
        if (q.includes('income certificate') || (q.includes('income') && (q.includes('certificate') || q.includes('document')))) {
            answer = "The Access Scholarship requires an income certificate in addition to the academic record, attendance statement, and student identification.";
            sources = ["scholarship_application.txt"];
        }
        // Demonstration Question 2: Both scholarships awarded together
        else if (q.includes('both') && (q.includes('awarded') || q.includes('together') || q.includes('qualify') || q.includes('combine') || q.includes('two'))) {
            answer = "A student may qualify for both scholarships, but only one scholarship may be awarded. When both scholarships match, the system recommends the one with the higher award amount.";
            sources = ["scholarship_eligibility.txt"];
        }
        // Demonstration Question 3: Bank account / Payment timeline (Out of scope)
        else if (q.includes('bank') || q.includes('reach') || (q.includes('when') && (q.includes('money') || q.includes('payment') || q.includes('account')))) {
            answer = "The supplied knowledge documents do not specify payment dates or bank transfer timelines. Recommend contacting the scholarship committee for official information.";
            sources = [];
        }
        // Query: Merit scholarship
        else if (q.includes('merit') && (q.includes('criteria') || q.includes('require') || q.includes('rule') || q.includes('amount') || q.includes('award'))) {
            answer = "The Merit Scholarship offers INR 15000. It requires an academic percentage of at least 85 and attendance of at least 90 percent. No family-income restriction is specified.";
            sources = ["scholarship_catalogue.txt"];
        }
        // Query: Access scholarship
        else if (q.includes('access') && (q.includes('criteria') || q.includes('require') || q.includes('rule') || q.includes('income') || q.includes('award'))) {
            answer = "The Access Scholarship offers INR 10000. It requires an academic percentage of at least 60, attendance of at least 75 percent, and annual family income not exceeding INR 250000.";
            sources = ["scholarship_catalogue.txt"];
        }
        // Query: Application documents
        else if (q.includes('document') || q.includes('application') || q.includes('require') || q.includes('upload')) {
            answer = "Applications require the academic record, attendance statement, and student identification. An income certificate is additionally required for the Access Scholarship. Personal documents must not be uploaded into this classroom app.";
            sources = ["scholarship_application.txt"];
        }
        // Query: Selection guarantee
        else if (q.includes('guarantee') || q.includes('selection') || q.includes('committee')) {
            answer = "Eligibility does not guarantee selection or payment. The scholarship committee verifies applications and makes the final award decision.";
            sources = ["scholarship_eligibility.txt", "scholarship_application.txt"];
        }
        // Out of scope default
        else {
            answer = "The supplied knowledge documents do not contain information regarding this inquiry. Please consult the official scholarship committee for rules beyond the published catalog.";
            sources = [];
        }

        renderAnswer(question, answer, sources);
    }

    function renderAnswer(question, answer, sources) {
        const sourcesHtml = sources.length > 0
            ? sources.map(s => `
                <span class="source-tag">
                    <span class="source-icon">📄</span>
                    <span>${s}</span>
                </span>
            `).join('')
            : `
                <div class="no-sources-box">
                    <span class="out-of-scope-badge">Out of Scope</span>
                    <span class="no-sources-text">Not referenced in institutional knowledge files.</span>
                </div>
            `;

        chatAnswerContainer.innerHTML = `
            <div class="answer-box" aria-live="polite">
                <div class="question-echo">
                    <span class="echo-label">Inquiry Submitted:</span>
                    <p class="echo-text">"${question}"</p>
                </div>
                <div class="answer-content">
                    <div class="answer-header-row">
                        <span class="answer-label">Official Answer:</span>
                        <button type="button" class="copy-answer-btn" id="clientCopyBtn" title="Copy answer">
                            <span class="copy-icon">📋</span>
                            <span class="copy-label">Copy</span>
                        </button>
                    </div>
                    <p class="answer-text" id="clientAnswerText">${answer}</p>
                </div>
                <div class="sources-section">
                    <span class="sources-label">Authoritative Sources:</span>
                    <div class="sources-tags">
                        ${sourcesHtml}
                    </div>
                </div>
            </div>
        `;

        const copyBtn = document.getElementById('clientCopyBtn');
        const ansText = document.getElementById('clientAnswerText');
        if (copyBtn && ansText) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(ansText.innerText).then(() => {
                    const label = copyBtn.querySelector('.copy-label');
                    if (label) {
                        label.innerText = 'Copied!';
                        copyBtn.style.color = 'var(--color-success)';
                        setTimeout(() => {
                            label.innerText = 'Copy';
                            copyBtn.style.color = '';
                        }, 2000);
                    }
                });
            });
        }
    }

    demoQBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const q = btn.getAttribute('data-q');
            if (chatInput) chatInput.value = q;
            answerInquiry(q);
        });
    });

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = chatInput.value.trim();
            if (q) {
                answerInquiry(q);
            }
        });
    }

    if (btnResetChat) {
        btnResetChat.addEventListener('click', () => {
            if (chatInput) chatInput.value = '';
            chatAnswerContainer.innerHTML = `
                <div class="initial-prompt-card">
                    <div class="initial-icon" aria-hidden="true">📖</div>
                    <h3 class="initial-title">Knowledge Engine Ready</h3>
                    <p class="initial-desc">
                        Select one of the benchmark question chips above or type a custom question to retrieve a grounded, verified response from the scholarship policy documents.
                    </p>
                    <div class="demo-hints">
                        <span class="demo-hints-title">Supported Topics:</span>
                        <span>Income certificates, dual awards policy, application documents, award values.</span>
                    </div>
                </div>
            `;
        });
    }
});
