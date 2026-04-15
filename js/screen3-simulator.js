// screen3-simulator.js — Crowd Simulator logic

(function () {

  // ── State ───────────────────────────────────────────────────
  let state = { attendance: 52000, staff: 28, gates: 7 };
  let spike = { waitTime: 0, gatePressure: 0, queueLen: 0, exitTime: 0 };
  let spikeTimer = null;

  // ── Formulas ────────────────────────────────────────────────
  function calcMetrics () {
    const { attendance, staff, gates } = state;

    const waitTime = Math.min(45, Math.max(1,
      Math.round(8 + (attendance / 10000) * 2.5 - staff * 0.4 + (12 - gates) * 1.2 + (spike.waitTime || 0))
    ));
    const gatePressure = Math.min(100, Math.max(0,
      Math.round((attendance / 800) - gates * 3.5 + (spike.gatePressure || 0))
    ));
    const queueLen = Math.min(500, Math.max(10,
      Math.round((attendance / 1000) * (50 / Math.max(staff, 1)) * 0.4 + (spike.queueLen || 0))
    ));
    const exitTime = Math.min(60, Math.max(5,
      Math.round(attendance / (gates * 800) + (spike.exitTime || 0))
    ));

    return { waitTime, gatePressure, queueLen, exitTime };
  }

  function getStatus (key, val) {
    const thresh = {
      waitTime:     { good: 10, warn: 20 },
      gatePressure: { good: 40, warn: 65 },
      queueLen:     { good: 100, warn: 250 },
      exitTime:     { good: 15, warn: 30 },
    };
    const t = thresh[key];
    if (val <= t.good) return 'good';
    if (val <= t.warn) return 'warn';
    return 'crit';
  }

  const STATUS_LABEL = { good: '● OPTIMAL', warn: '● ELEVATED', crit: '● CRITICAL' };

  // ── Animated counter ────────────────────────────────────────
  let prevMetrics = { waitTime: 12, gatePressure: 47, queueLen: 74, exitTime: 9 };

  function animCount (el, from, to, dur = 320) {
    const start = performance.now();
    const step  = (ts) => {
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(from + (to - from) * e).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const METRIC_MAP = [
    { key: 'waitTime',     id: 'metric-wait',     cardId: 'card-wait',     unit: 'min' },
    { key: 'gatePressure', id: 'metric-pressure',  cardId: 'card-pressure', unit: '/100' },
    { key: 'queueLen',     id: 'metric-queue',     cardId: 'card-queue',    unit: 'ppl' },
    { key: 'exitTime',     id: 'metric-exit',      cardId: 'card-exit',     unit: 'min' },
  ];

  function updateMetrics () {
    const m = calcMetrics();

    METRIC_MAP.forEach(({ key, id, cardId }) => {
      const numEl  = document.getElementById(id);
      const cardEl = document.getElementById(cardId);
      if (!numEl || !cardEl) return;

      const from   = prevMetrics[key] || 0;
      const to     = m[key];
      const status = getStatus(key, to);

      animCount(numEl, from, to);

      cardEl.className = `metric-card ${status}`;
      const statusEl = cardEl.querySelector('.metric-status');
      if (statusEl) statusEl.textContent = STATUS_LABEL[status];
    });

    prevMetrics = { ...m };
    updateSimChart(m);
  }

  // ── SVG bar chart ───────────────────────────────────────────
  function updateSimChart (m) {
    const svg = document.getElementById('sim-bar-chart');
    if (!svg) return;

    const { attendance, staff, gates } = state;
    const vals   = [
      m.waitTime     / 45  * 100,
      m.gatePressure,
      m.queueLen     / 500 * 100,
      m.exitTime     / 60  * 100,
      (attendance - 20000) / 60000 * 100,
      (50 - staff)  / 45   * 100,
      (12 - gates)  / 10   * 100,
      30 + Math.random() * 40,
    ];
    const labels = ['Wait', 'Gate', 'Queue', 'Exit', 'Attend', 'Staff', 'Gates', 'Load'];

    const W     = svg.clientWidth || svg.parentElement?.clientWidth || 500;
    const H     = 180;
    const n     = vals.length;
    const barW  = Math.floor((W - 16) / n * 0.65);
    const step  = Math.floor((W - 16) / n);
    const svgNS = 'http://www.w3.org/2000/svg';

    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${W} ${H + 28}`);

    vals.forEach((v, i) => {
      const clamped = Math.min(100, Math.max(2, v));
      const bh      = (clamped / 100) * H;
      const x       = 8 + i * step + (step - barW) / 2;
      const y       = H - bh;
      const color   = clamped < 40 ? '#4ade80' : clamped < 70 ? '#fbbc05' : '#ff6b6b';

      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barW);
      rect.setAttribute('height', bh);
      rect.setAttribute('rx', '5');
      rect.setAttribute('fill', color);
      rect.setAttribute('opacity', '0.82');
      svg.appendChild(rect);

      // label
      const txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', x + barW / 2);
      txt.setAttribute('y', H + 16);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', '#8c909f');
      txt.setAttribute('font-size', '8');
      txt.setAttribute('font-family', 'Manrope, sans-serif');
      txt.setAttribute('font-weight', '700');
      txt.textContent = labels[i];
      svg.appendChild(txt);

      // val label
      if (bh > 16) {
        const vt = document.createElementNS(svgNS, 'text');
        vt.setAttribute('x', x + barW / 2);
        vt.setAttribute('y', y - 4);
        vt.setAttribute('text-anchor', 'middle');
        vt.setAttribute('fill', color);
        vt.setAttribute('font-size', '7');
        vt.setAttribute('font-family', 'Manrope, sans-serif');
        vt.setAttribute('font-weight', '700');
        vt.textContent = Math.round(clamped) + '%';
        svg.appendChild(vt);
      }
    });
  }

  window._simChartInit = () => updateSimChart(calcMetrics());

  // ── Match event narratives ──────────────────────────────────
  const NARRATIVES = {
    goal: {
      title: 'GOAL EVENT — AI RESPONSE',
      text:  "Goal scored at 67' — Predicting concession surge in 4.2 minutes. Pre-positioning Team Charlie at Sector 3 South Pavilion. LED signage updated on 34 nodes to redirect Gate 5 flow eastward. Predicted queue delta: +127 persons in 6 minutes.",
      spike: { waitTime: 4, gatePressure: 15, queueLen: 50, exitTime: 2 },
    },
    halftime: {
      title: 'HALFTIME — AI RESPONSE',
      text:  "Halftime detected — Mass egress imminent across 6 concourse points. Slot-based pre-order window opened for 18-minute window. Metro authority notified: +14,000 passenger forecast in 18 minutes. All 4 auxiliary gates opened. Staff rebalancing initiated across 12 zones.",
      spike: { waitTime: 8, gatePressure: 20, queueLen: 80, exitTime: 5 },
    },
    fulltime: {
      title: 'FULL TIME — AI RESPONSE',
      text:  "Match ended — Initiating staggered exit protocol across all sectors. Section A exits 14:47, Section B 14:52, Section C 14:57, Section D 15:02. Ride-share staging capacity increased 300%. Transport pre-alert issued 35 minutes prior. All gates active. ETA full clearance: 47 minutes.",
      spike: { waitTime: 15, gatePressure: 30, queueLen: 150, exitTime: 12 },
    },
    rain: {
      title: 'HEAVY RAIN EVENT — AI RESPONSE',
      text:  "Weather event detected — Rerouting 22% of crowd to 8 covered concourses. LED signage updated across all 34 display nodes with shelter directions. Concession wait time ETA recalculated: average +3.2 minutes. Roof gates B4, B5, C2 opened automatically.",
      spike: { waitTime: 5, gatePressure: 10, queueLen: 40, exitTime: 3 },
    },
    medical: {
      title: 'MEDICAL INCIDENT — AI RESPONSE',
      text:  "Medical code triggered at Sector 7, Row J, Seat 14. Zone immediately cleared via automated LED protocol. Emergency corridor opened via Gate 2 North. 3 stewards rerouted from Fan Plaza. Medical team ETA: 2.1 minutes. Average crowd impact: minimal.",
      spike: { waitTime: 3, gatePressure: 8, queueLen: 25, exitTime: 2 },
    },
  };

  function fireEvent (key) {
    const ev = NARRATIVES[key];
    if (!ev) return;

    // Set spike
    spike = { ...ev.spike };
    updateMetrics();

    // Show narrative
    const card  = document.getElementById('narrative-card');
    const title = document.getElementById('narrative-title');
    const text  = document.getElementById('narrative-text');
    if (card && title && text) {
      title.textContent = ev.title;
      text.textContent  = ev.text;
      card.classList.add('visible');
    }

    // Clear previous spike timer
    if (spikeTimer) clearTimeout(spikeTimer);
    spikeTimer = setTimeout(() => {
      spike = { waitTime: 0, gatePressure: 0, queueLen: 0, exitTime: 0 };
      updateMetrics();
    }, 5500);
  }

  // ── Slider init ─────────────────────────────────────────────
  function initSliders () {
    const sliders = [
      { id: 'slider-attendance', valId: 'val-attendance', key: 'attendance', fmt: v => parseInt(v).toLocaleString() },
      { id: 'slider-staff',      valId: 'val-staff',      key: 'staff',      fmt: v => v },
      { id: 'slider-gates',      valId: 'val-gates',      key: 'gates',      fmt: v => v },
    ];

    sliders.forEach(({ id, valId, key, fmt }) => {
      const inp = document.getElementById(id);
      const lbl = document.getElementById(valId);
      if (!inp) return;

      inp.addEventListener('input', () => {
        state[key] = parseInt(inp.value, 10);
        if (lbl) lbl.textContent = fmt(inp.value);
        updateMetrics();
      });
    });
  }

  // ── Event buttons ───────────────────────────────────────────
  function initEventButtons () {
    document.querySelectorAll('.event-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.event-btn').forEach(b => b.classList.remove('firing'));
        btn.classList.add('firing');
        fireEvent(btn.dataset.event);
        setTimeout(() => btn.classList.remove('firing'), 600);
      });
    });
  }

  // ── Boot ───────────────────────────────────────────────────
  function boot () {
    initSliders();
    initEventButtons();
    updateMetrics();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
