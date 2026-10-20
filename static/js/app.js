/**
 * SmartScholar™ Institutional Portal — Real-Time Production Script
 * High-performance client-side reactivity, asynchronous RAG chat,
 * real-time criteria evaluation, and official certificate generation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. Theme Management (Light / Dark)
    // =========================================================================
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

    // =========================================================================
    // 2. Real-Time Eligibility Evaluator & Dual Controls
    // =========================================================================
    const acadInput = document.getElementById('academic_percentage');
    const acadSlider = document.getElementById('acadSlider');
    const acadValDisplay = document.getElementById('acadValDisplay');

    const attInput = document.getElementById('attendance_percentage');
    const attSlider = document.getElementById('attSlider');
    const attValDisplay = document.getElementById('attValDisplay');

    const incInput = document.getElementById('annual_family_income');
    const incValDisplay = document.getElementById('incValDisplay');

    const liveCalcToggle = document.getElementById('liveCalcToggle');
    const resultsContainer = document.getElementById('resultsDisplayContainer');
    const eligibilityForm = document.getElementById('eligibilityForm');
    const clientErrorAlert = document.getElementById('clientErrorAlert');
    const clientErrorMessage = document.getElementById('clientErrorMessage');
    const serverErrorAlert = document.getElementById('serverErrorAlert');

    // Threshold meter chips
    const meterAcadAccess = document.getElementById('meterAcadAccess');
    const meterAcadMerit = document.getElementById('meterAcadMerit');
    const meterAttAccess = document.getElementById('meterAttAccess');
    const meterAttMerit = document.getElementById('meterAttMerit');
    const meterIncAccess = document.getElementById('meterIncAccess');

    // Sync Academic Input & Slider
    if (acadInput && acadSlider) {
        acadInput.addEventListener('input', () => {
            const val = parseFloat(acadInput.value);
            if (!isNaN(val)) {
                acadSlider.value = Math.min(Math.max(val, 0), 100);
                if (acadValDisplay) acadValDisplay.textContent = `${val.toFixed(1)}%`;
            }
            onMetricsChanged();
        });

        acadSlider.addEventListener('input', () => {
            acadInput.value = parseFloat(acadSlider.value).toFixed(1);
            if (acadValDisplay) acadValDisplay.textContent = `${acadSlider.value}%`;
            onMetricsChanged();
        });
    }

    // Sync Attendance Input & Slider
    if (attInput && attSlider) {
        attInput.addEventListener('input', () => {
            const val = parseFloat(attInput.value);
            if (!isNaN(val)) {
                attSlider.value = Math.min(Math.max(val, 0), 100);
                if (attValDisplay) attValDisplay.textContent = `${val.toFixed(1)}%`;
            }
            onMetricsChanged();
        });

        attSlider.addEventListener('input', () => {
            attInput.value = parseFloat(attSlider.value).toFixed(1);
            if (attValDisplay) attValDisplay.textContent = `${attSlider.value}%`;
            onMetricsChanged();
        });
    }

    // Income Quick Increments
    if (incInput) {
        incInput.addEventListener('input', () => {
            const val = parseFloat(incInput.value);
            if (incValDisplay) {
                incValDisplay.textContent = !isNaN(val) ? `₹${Math.round(val).toLocaleString('en-IN')}` : '₹0';
            }
            onMetricsChanged();
        });

        document.querySelectorAll('.inc-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const add = btn.getAttribute('data-add');
                const set = btn.getAttribute('data-set');
                let current = parseFloat(incInput.value) || 0;

                if (add) {
                    current += parseFloat(add);
                } else if (set) {
                    current = parseFloat(set);
                }

                incInput.value = current;
                if (incValDisplay) incValDisplay.textContent = `₹${Math.round(current).toLocaleString('en-IN')}`;
                onMetricsChanged();
            });
        });
    }

    // Scenario Presets Click Handlers
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const acad = btn.getAttribute('data-acad');
            const att = btn.getAttribute('data-att');
            const inc = btn.getAttribute('data-inc');

            if (acadInput) acadInput.value = acad;
            if (acadSlider) acadSlider.value = acad;
            if (acadValDisplay) acadValDisplay.textContent = `${acad}%`;

            if (attInput) attInput.value = att;
            if (attSlider) attSlider.value = att;
            if (attValDisplay) attValDisplay.textContent = `${att}%`;

            if (incInput) incInput.value = inc;
            if (incValDisplay) incValDisplay.textContent = `₹${parseInt(inc).toLocaleString('en-IN')}`;

            onMetricsChanged(true);
        });
    });

    // Reset All Button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (acadInput) acadInput.value = '';
            if (acadSlider) acadSlider.value = 75;
            if (acadValDisplay) acadValDisplay.textContent = '0%';

            if (attInput) attInput.value = '';
            if (attSlider) attSlider.value = 85;
            if (attValDisplay) attValDisplay.textContent = '0%';

            if (incInput) incInput.value = '';
            if (incValDisplay) incValDisplay.textContent = '₹0';

            hideError();
            updateCriteriaMeters(NaN, NaN, NaN);

            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="ready-evaluation-prompt">
                        <div class="prompt-icon-ring" aria-hidden="true">📋</div>
                        <h3 class="prompt-title">Engine Ready for Input</h3>
                        <p class="prompt-body">
                            Enter your academic metrics on the left or select a quick scenario preset. The system will evaluate your profile against the authoritative institutional guidelines in real-time.
                        </p>
                        <div class="prompt-chips">
                            <span class="p-chip-label">Supported Schemes:</span>
                            <span class="p-chip">Merit Award (₹15,000)</span>
                            <span class="p-chip">Access Award (₹10,000)</span>
                        </div>
                    </div>
                `;
            }
        });
    }

    // Reactive Metrics Evaluation
    function onMetricsChanged(forceRecalc = false) {
        if (!acadInput || !attInput || !incInput) return;

        const acad = parseFloat(acadInput.value);
        const att = parseFloat(attInput.value);
        const inc = parseFloat(incInput.value);

        updateCriteriaMeters(acad, att, inc);

        const isLive = liveCalcToggle ? liveCalcToggle.checked : true;
        if ((isLive || forceRecalc) && !isNaN(acad) && !isNaN(att) && !isNaN(inc)) {
            runClientEvaluation(acad, att, inc);
        }
    }

    function updateCriteriaMeters(acad, att, inc) {
        if (meterAcadAccess) {
            const met = !isNaN(acad) && acad >= 60.0 && acad <= 100.0;
            meterAcadAccess.classList.toggle('met', met);
            meterAcadAccess.querySelector('.meter-status').textContent = met ? '✓' : '○';
        }
        if (meterAcadMerit) {
            const met = !isNaN(acad) && acad >= 85.0 && acad <= 100.0;
            meterAcadMerit.classList.toggle('met', met);
            meterAcadMerit.querySelector('.meter-status').textContent = met ? '✓' : '○';
        }

        if (meterAttAccess) {
            const met = !isNaN(att) && att >= 75.0 && att <= 100.0;
            meterAttAccess.classList.toggle('met', met);
            meterAttAccess.querySelector('.meter-status').textContent = met ? '✓' : '○';
        }
        if (meterAttMerit) {
            const met = !isNaN(att) && att >= 90.0 && att <= 100.0;
            meterAttMerit.classList.toggle('met', met);
            meterAttMerit.querySelector('.meter-status').textContent = met ? '✓' : '○';
        }

        if (meterIncAccess) {
            const met = !isNaN(inc) && inc >= 0 && inc <= 250000.0;
            meterIncAccess.classList.toggle('met', met);
            meterIncAccess.querySelector('.meter-status').textContent = met ? '✓' : '○';
        }
    }

    function showError(msg) {
        if (clientErrorAlert && clientErrorMessage) {
            clientErrorMessage.textContent = msg;
            clientErrorAlert.classList.remove('hidden');
        }
        if (serverErrorAlert) serverErrorAlert.classList.add('hidden');
    }

    function hideError() {
        if (clientErrorAlert) clientErrorAlert.classList.add('hidden');
    }

    function runClientEvaluation(acad, att, inc) {
        hideError();

        // Strict range validation replicating scholarship_tool.py
        if (acad < 0.0 || acad > 100.0) {
            showError("Academic percentage must be between 0 and 100.");
            return;
        }
        if (att < 0.0 || att > 100.0) {
            showError("Attendance percentage must be between 0 and 100.");
            return;
        }
        if (inc < 0.0) {
            showError("Annual family income must be non-negative.");
            return;
        }

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
            const rec = eligible.reduce((prev, cur) => (cur.award > prev.award ? cur : prev));
            recommended = rec.name;
            recommendedAward = rec.award;
        }

        renderRealtimeResults(eligible, recommended, recommendedAward);
    }

    function renderRealtimeResults(eligible, recommended, award) {
        if (!resultsContainer) return;

        if (eligible.length > 0) {
            const listHtml = eligible.map(sch => `
                <div class="program-card-item ${sch.name === recommended ? 'is-optimal' : ''}">
                    <div class="prog-top">
                        <div class="prog-meta">
                            <span class="prog-icon">${sch.name.includes('Merit') ? '🏆' : '🤝'}</span>
                            <h5 class="prog-name">${sch.name}</h5>
                        </div>
                        ${sch.name === recommended 
                            ? '<span class="prog-status-pill optimal">★ Recommended</span>' 
                            : '<span class="prog-status-pill eligible">✓ Eligible</span>'
                        }
                    </div>
                    <div class="prog-bottom">
                        <div class="prog-award">
                            <span class="p-label">Award Value:</span>
                            <strong class="p-val">₹${sch.award.toLocaleString('en-IN')}</strong>
                        </div>
                        <div class="prog-verified">
                            <span class="v-icon">✓</span>
                            <span>Independent Criteria Satisfied</span>
                        </div>
                    </div>
                </div>
            `).join('');

            resultsContainer.innerHTML = `
                <div class="rec-banner-card" aria-live="polite">
                    <div class="rec-badge-strip">
                        <span class="rec-crown-icon">★</span>
                        <span class="rec-headline">Recommended Scholarship</span>
                        <span class="rec-pill-high">Optimal Award</span>
                    </div>
                    
                    <h3 class="rec-program-name">${recommended}</h3>
                    
                    <div class="rec-amount-row">
                        <span class="curr-sign">INR</span>
                        <span class="amount-number">₹${award.toLocaleString('en-IN')}</span>
                    </div>

                    <p class="rec-rationale-text">
                        ${eligible.length > 1 
                            ? '<strong>Dual Qualification Recognized:</strong> You satisfy the eligibility criteria for both the <strong>Merit Scholarship</strong> and <strong>Access Scholarship</strong>. Because institutional policy permits only one scholarship per recipient, the system recommends the program offering the higher financial award.'
                            : '<strong>Direct Matching:</strong> You have satisfied all institutional requirements for this scholarship based on verified student criteria.'
                        }
                    </p>
                </div>

                <div class="matching-programs-section">
                    <h4 class="matching-title">
                        <span>Qualified Programs (${eligible.length})</span>
                    </h4>
                    <div class="programs-stack">
                        ${listHtml}
                    </div>
                </div>

                <div class="policy-disclaimer-box" role="note">
                    <span class="disclaimer-symbol" aria-hidden="true">⚖️</span>
                    <div class="disclaimer-details">
                        <strong class="disclaimer-title">Statutory Regulatory Notice:</strong>
                        <p class="disclaimer-body">Eligibility does not guarantee selection or payment. The scholarship committee makes the final award decision.</p>
                    </div>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="no-match-card" aria-live="polite">
                    <div class="no-match-badge" aria-hidden="true">🔍</div>
                    <h3 class="no-match-title">No Matching Scholarships Found</h3>
                    <p class="no-match-desc">
                        None of the institutional scholarship programs currently match the supplied student metrics.
                    </p>
                    
                    <div class="benchmark-requirements-box">
                        <span class="req-box-title">Required Institutional Thresholds:</span>
                        <div class="req-rule-item">
                            <span class="r-icon">🏆</span>
                            <div class="r-body">
                                <strong>Merit Scholarship (₹15,000):</strong>
                                <span>Academic &ge; 85% AND Attendance &ge; 90% (Open to all income levels).</span>
                            </div>
                        </div>
                        <div class="req-rule-item">
                            <span class="r-icon">🤝</span>
                            <div class="r-body">
                                <strong>Access Scholarship (₹10,000):</strong>
                                <span>Academic &ge; 60%, Attendance &ge; 75%, AND Annual Income &le; ₹2,50,000.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="policy-disclaimer-box" role="note">
                    <span class="disclaimer-symbol" aria-hidden="true">⚖️</span>
                    <div class="disclaimer-details">
                        <strong class="disclaimer-title">Statutory Regulatory Notice:</strong>
                        <p class="disclaimer-body">Eligibility does not guarantee selection or payment. The scholarship committee makes the final award decision.</p>
                    </div>
                </div>
            `;
        }
    }

    // Initial run on page load if inputs already have values
    onMetricsChanged();

    // =========================================================================
    // 3. Official Certificate Generation Modal
    // =========================================================================
    const printCertBtn = document.getElementById('printCertBtn');
    const certModal = document.getElementById('certModal');
    const btnCloseCertModal = document.getElementById('btnCloseCertModal');
    const btnExecutePrint = document.getElementById('btnExecutePrint');

    if (printCertBtn && certModal) {
        printCertBtn.addEventListener('click', () => {
            const acad = parseFloat(acadInput?.value) || 0;
            const att = parseFloat(attInput?.value) || 0;
            const inc = parseFloat(incInput?.value) || 0;

            // Populate certificate fields
            const certAcadVal = document.getElementById('certAcadVal');
            const certAttVal = document.getElementById('certAttVal');
            const certIncVal = document.getElementById('certIncVal');
            const certRefNumber = document.getElementById('certRefNumber');
            const certIssueDate = document.getElementById('certIssueDate');
            const certMatrixBody = document.getElementById('certMatrixBody');
            const certRecTitle = document.getElementById('certRecTitle');
            const certRecAmount = document.getElementById('certRecAmount');

            if (certAcadVal) certAcadVal.textContent = `${acad.toFixed(2)}%`;
            if (certAttVal) certAttVal.textContent = `${att.toFixed(2)}%`;
            if (certIncVal) certIncVal.textContent = `₹${Math.round(inc).toLocaleString('en-IN')}`;

            const randRef = Math.floor(1000 + Math.random() * 9000);
            if (certRefNumber) certRefNumber.textContent = `SCH-2026-${randRef}`;
            if (certIssueDate) certIssueDate.textContent = `Date: ${new Date().toISOString().split('T')[0]}`;

            const meritPass = acad >= 85.0 && att >= 90.0;
            const accessPass = acad >= 60.0 && att >= 75.0 && inc <= 250000.0;

            if (certMatrixBody) {
                certMatrixBody.innerHTML = `
                    <tr>
                        <td>Merit Scholarship</td>
                        <td>Academic &ge; 85% &amp; Attendance &ge; 90%</td>
                        <td>${meritPass ? '<span class="cert-pass">✓ ELIGIBLE</span>' : '<span style="color:#dc2626">✗ NOT ELIGIBLE</span>'}</td>
                        <td>₹15,000</td>
                    </tr>
                    <tr>
                        <td>Access Scholarship</td>
                        <td>Acad &ge; 60%, Att &ge; 75%, Inc &le; ₹2.5L</td>
                        <td>${accessPass ? '<span class="cert-pass">✓ ELIGIBLE</span>' : '<span style="color:#dc2626">✗ NOT ELIGIBLE</span>'}</td>
                        <td>₹10,000</td>
                    </tr>
                `;
            }

            if (meritPass) {
                if (certRecTitle) certRecTitle.textContent = 'Merit Scholarship';
                if (certRecAmount) certRecAmount.innerHTML = 'Recommended Award: <strong>₹15,000</strong>';
            } else if (accessPass) {
                if (certRecTitle) certRecTitle.textContent = 'Access Scholarship';
                if (certRecAmount) certRecAmount.innerHTML = 'Recommended Award: <strong>₹10,000</strong>';
            } else {
                if (certRecTitle) certRecTitle.textContent = 'No Matching Scholarship';
                if (certRecAmount) certRecAmount.innerHTML = 'Recommended Award: <strong>None</strong>';
            }

            certModal.classList.remove('hidden');
        });

        if (btnCloseCertModal) {
            btnCloseCertModal.addEventListener('click', () => {
                certModal.classList.add('hidden');
            });
        }

        if (btnExecutePrint) {
            btnExecutePrint.addEventListener('click', () => {
                window.print();
            });
        }
    }

    // =========================================================================
    // 4. Asynchronous Real-Time Chat Assistant (RAG)
    // =========================================================================
    const chatComposerForm = document.getElementById('chatComposerForm');
    const questionInput = document.getElementById('questionInput');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    const btnClearChat = document.getElementById('btnClearChat');
    const promptChips = document.querySelectorAll('.chip-q-btn');

    function appendMessage(sender, text, isUser, sources = []) {
        if (!chatMessages) return;

        const row = document.createElement('div');
        row.className = `message-row ${isUser ? 'user-row' : 'assistant-row'}`;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isUser) {
            row.innerHTML = `
                <div class="msg-bubble user-bubble">
                    <div class="msg-header">
                        <strong class="msg-sender">${sender}</strong>
                        <span class="msg-timestamp">${timeStr}</span>
                    </div>
                    <div class="msg-content">
                        <p>${text}</p>
                    </div>
                </div>
                <div class="msg-avatar user-avatar-icon">👤</div>
            `;
        } else {
            let sourcesHtml = '';
            if (sources && sources.length > 0) {
                sourcesHtml = sources.map(s => `<span class="citation-pill">📄 ${s}</span>`).join(' ');
            } else {
                sourcesHtml = `<span class="out-of-scope-pill">Out of Scope</span>`;
            }

            row.innerHTML = `
                <div class="msg-avatar">🎓</div>
                <div class="msg-bubble assistant-bubble">
                    <div class="msg-header">
                        <strong class="msg-sender">${sender}</strong>
                        <span class="msg-timestamp">${timeStr}</span>
                    </div>
                    <div class="msg-content">
                        <p class="streaming-text">${text}</p>
                    </div>
                    <div class="msg-sources">
                        <span class="sources-caption">Sources:</span>
                        ${sourcesHtml}
                    </div>
                </div>
            `;
        }

        chatMessages.appendChild(row);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendInquiryAsync(question) {
        if (!question || !question.trim()) return;

        appendMessage('Applicant', question, true);
        if (questionInput) questionInput.value = '';

        if (typingIndicator) typingIndicator.classList.remove('hidden');
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const resp = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question.trim() })
            });

            if (typingIndicator) typingIndicator.classList.add('hidden');

            if (resp.ok) {
                const data = await resp.json();
                appendMessage('SmartScholar Intelligence', data.answer, false, data.sources);
            } else {
                const errData = await resp.json();
                appendMessage('SmartScholar Intelligence', errData.error || 'Unable to retrieve answer.', false, []);
            }
        } catch (err) {
            if (typingIndicator) typingIndicator.classList.add('hidden');
            appendMessage('SmartScholar Intelligence', 'Network error communicating with the intelligence service.', false, []);
        }
    }

    if (chatComposerForm) {
        chatComposerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = questionInput ? questionInput.value : '';
            sendInquiryAsync(q);
        });
    }

    promptChips.forEach(btn => {
        btn.addEventListener('click', () => {
            const q = btn.getAttribute('data-question');
            sendInquiryAsync(q);
        });
    });

    if (btnClearChat && chatMessages) {
        btnClearChat.addEventListener('click', () => {
            chatMessages.innerHTML = `
                <div class="message-row assistant-row">
                    <div class="msg-avatar">🎓</div>
                    <div class="msg-bubble assistant-bubble">
                        <div class="msg-header">
                            <strong class="msg-sender">SmartScholar Intelligence</strong>
                            <span class="msg-timestamp">System</span>
                        </div>
                        <div class="msg-content">
                            <p>Conversation cleared. You can ask any question regarding institutional scholarship rules, eligibility criteria, and required application paperwork.</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // =========================================================================
    // 5. Document Inspector Modal
    // =========================================================================
    const btnOpenDocsModal = document.getElementById('btnOpenDocsModal');
    const docsModal = document.getElementById('docsModal');
    const btnCloseDocsModal = document.getElementById('btnCloseDocsModal');
    const docTabBtns = document.querySelectorAll('.doc-tab-btn');
    const docSearchInput = document.getElementById('docSearchInput');

    if (btnOpenDocsModal && docsModal) {
        btnOpenDocsModal.addEventListener('click', () => docsModal.classList.remove('hidden'));
        if (btnCloseDocsModal) {
            btnCloseDocsModal.addEventListener('click', () => docsModal.classList.add('hidden'));
        }

        docTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                docTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const target = btn.getAttribute('data-doc');
                document.querySelectorAll('.doc-text-block').forEach(block => {
                    block.classList.remove('active');
                });

                if (target === 'catalogue') document.getElementById('docCatalogue')?.classList.add('active');
                if (target === 'eligibility') document.getElementById('docEligibility')?.classList.add('active');
                if (target === 'application') document.getElementById('docApplication')?.classList.add('active');
            });
        });

        if (docSearchInput) {
            docSearchInput.addEventListener('input', () => {
                const term = docSearchInput.value.trim().toLowerCase();
                document.querySelectorAll('.doc-text-block').forEach(block => {
                    const originalText = block.getAttribute('data-raw') || block.textContent;
                    if (!block.getAttribute('data-raw')) {
                        block.setAttribute('data-raw', originalText);
                    }

                    if (!term) {
                        block.textContent = originalText;
                    } else {
                        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                        block.innerHTML = originalText.replace(regex, '<mark style="background:#fde047;color:#000;padding:1px 3px;border-radius:2px;">$1</mark>');
                    }
                });
            });
        }
    }
});
