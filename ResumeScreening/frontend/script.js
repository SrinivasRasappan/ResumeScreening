const API_BASE = 'http://localhost:8000';

// ── DOM refs ──────────────────────────────────────────────
const jobTitle       = document.getElementById('jobTitle');
const jobDescription = document.getElementById('jobDescription');
const resumeText     = document.getElementById('resumeText');
const resumeFile     = document.getElementById('resumeFile');
const fileName       = document.getElementById('fileName');
const analyzeBtn     = document.getElementById('analyzeBtn');
const statusMsg      = document.getElementById('statusMsg');
const results        = document.getElementById('results');
const dropzone       = document.getElementById('dropzone');

// Result elements
const gaugeArc        = document.getElementById('gaugeArc');
const matchPct        = document.getElementById('matchPct');
const recommendBadge  = document.getElementById('recommendBadge');
const recommendReason = document.getElementById('recommendReason');
const overallSummary  = document.getElementById('overallSummary');
const aiAlert         = document.getElementById('aiAlert');
const aiConfBadge     = document.getElementById('aiConfBadge');
const aiAlertSub      = document.getElementById('aiAlertSub');
const aiIndicators    = document.getElementById('aiIndicators');
const aiClean         = document.getElementById('aiClean');
const aiCleanConf     = document.getElementById('aiCleanConf');
const matchedList     = document.getElementById('matchedList');
const missingList     = document.getElementById('missingList');
const strengthsList   = document.getElementById('strengthsList');
const concernsList    = document.getElementById('concernsList');

// ── Tabs ──────────────────────────────────────────────────
let activeTab = 'paste';
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${activeTab}`).classList.add('active');
  });
});

// ── File upload ───────────────────────────────────────────
resumeFile.addEventListener('change', () => {
  const f = resumeFile.files[0];
  fileName.textContent = f ? `Selected: ${f.name}` : '';
});

dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const f = e.dataTransfer.files[0];
  if (f) {
    const dt = new DataTransfer();
    dt.items.add(f);
    resumeFile.files = dt.files;
    fileName.textContent = `Selected: ${f.name}`;
  }
});

// ── Analyze ───────────────────────────────────────────────
analyzeBtn.addEventListener('click', analyze);

async function analyze() {
  const jd = jobDescription.value.trim();
  if (!jd) { showStatus('Please enter a job description.', true); return; }

  if (activeTab === 'paste') {
    const rt = resumeText.value.trim();
    if (!rt) { showStatus('Please paste the resume text.', true); return; }
    await screenText(jd, rt);
  } else {
    const file = resumeFile.files[0];
    if (!file) { showStatus('Please select a resume file.', true); return; }
    await screenFile(jd, file);
  }
}

async function screenText(jd, rt) {
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/screen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_description: jd, resume_text: rt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error ${res.status}`);
    }
    renderResults(await res.json());
  } catch (e) {
    showStatus(`Error: ${e.message}`, true);
  } finally {
    setLoading(false);
  }
}

async function screenFile(jd, file) {
  setLoading(true);
  try {
    const fd = new FormData();
    fd.append('job_description', jd);
    fd.append('resume_file', file);
    const res = await fetch(`${API_BASE}/screen/upload`, { method: 'POST', body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error ${res.status}`);
    }
    renderResults(await res.json());
  } catch (e) {
    showStatus(`Error: ${e.message}`, true);
  } finally {
    setLoading(false);
  }
}

// ── Render ────────────────────────────────────────────────
function renderResults(data) {
  // Gauge
  const pct = Math.max(0, Math.min(100, data.match_percentage || 0));
  const circumference = 2 * Math.PI * 65; // r=65
  const offset = circumference * (1 - pct / 100);

  gaugeArc.style.strokeDasharray  = circumference;
  gaugeArc.style.strokeDashoffset = circumference; // start at 0
  gaugeArc.classList.remove('green', 'yellow', 'red');
  if (pct >= 75) gaugeArc.classList.add('green');
  else if (pct >= 50) gaugeArc.classList.add('yellow');
  else gaugeArc.classList.add('red');

  // Animate gauge after a tick
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      gaugeArc.style.strokeDashoffset = offset;
    });
  });

  // Animate counter
  animateCounter(matchPct, 0, pct, 900);

  // Recommendation
  const rec = (data.recommendation || 'REVIEW').toUpperCase();
  recommendBadge.textContent = rec;
  recommendBadge.className = `recommend-badge ${rec}`;
  recommendReason.textContent = data.recommendation_reason || '';
  overallSummary.textContent  = data.overall_summary || '';

  // AI detection
  const aiGen  = !!data.ai_generated;
  const aiConf = data.ai_confidence || 0;
  aiAlert.classList.add('hidden');
  aiClean.classList.add('hidden');

  if (aiGen) {
    aiConfBadge.textContent = `${aiConf}% confidence`;
    aiAlertSub.textContent  = `This resume shows strong signs of AI generation. Proceed with caution.`;
    aiIndicators.innerHTML  = (data.ai_indicators || [])
      .map(i => `<li>${escHtml(i)}</li>`).join('');
    aiAlert.classList.remove('hidden');
  } else {
    aiCleanConf.textContent = `${100 - aiConf}% human confidence`;
    aiClean.classList.remove('hidden');
  }

  // Lists
  renderList(matchedList,   data.matched_requirements || []);
  renderList(missingList,   data.missing_requirements || []);
  renderList(strengthsList, data.strengths || []);
  renderList(concernsList,  data.concerns  || []);

  // Show panel
  results.classList.remove('hidden');
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showStatus('');
}

function renderList(el, items) {
  el.innerHTML = items.length
    ? items.map(i => `<li>${escHtml(i)}</li>`).join('')
    : `<li style="opacity:.5">None identified</li>`;
}

function animateCounter(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = `${Math.round(from + (to - from) * easeOut(progress))}%`;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ── Helpers ───────────────────────────────────────────────
function setLoading(on) {
  analyzeBtn.disabled = on;
  statusMsg.innerHTML = on
    ? `<div class="spinner"></div> Analyzing resume with Claude Opus…`
    : '';
}

function showStatus(msg, isError = false) {
  statusMsg.innerHTML = msg;
  statusMsg.style.color = isError ? '#dc2626' : '#64748b';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
