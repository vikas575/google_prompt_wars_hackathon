// screen2-ops.js — Ops Command Center logic

(function () {

  // ── Alert pool ──────────────────────────────────────────────
  const ALERT_POOL = [
    {
      sev: 'critical',
      text: 'Bottleneck detected at Grand North Entrance. Flow rate -42% below threshold. ETA critical in 3.1 minutes.',
      actions: ['RESOLVE']
    },
    {
      sev: 'warning',
      text: 'Sector 4 VIP Lounge reaching density limit at 91%. Recommend immediate crowd redirection via Gate 8.',
      actions: ['DEPLOY', 'DISMISS']
    },
    {
      sev: 'info',
      text: 'Transport API sync: Metro Line 3 reporting +14,200 passenger forecast. Pre-alert issued 35 minutes ahead.',
      actions: ['INFO']
    },
    {
      sev: 'critical',
      text: 'Concession overload: South Pavilion queue exceeds 380 people. AI recommending auxiliary stall activation.',
      actions: ['RESOLVE']
    },
    {
      sev: 'warning',
      text: 'Weather advisory: Heavy rain forecast in 18 minutes. Pre-routing 22% of crowd to covered concourses.',
      actions: ['DEPLOY', 'DISMISS']
    },
    {
      sev: 'info',
      text: 'Gate B4 pressure normalized. Throughput restored to 98.2% efficiency. No further action required.',
      actions: ['INFO']
    },
    {
      sev: 'critical',
      text: 'Gate pressure spike at East Entry — 1,400 fans converging. Recommend opening Gate 9 immediately.',
      actions: ['RESOLVE']
    },
    {
      sev: 'warning',
      text: 'Halftime surge predicted in 6.2 minutes. Slot-based pre-order window recommended for concessions.',
      actions: ['DEPLOY', 'DISMISS']
    },
  ];

  const SEV_COLOR = { critical: '#ff6b6b', warning: '#fbbc05', info: '#adc6ff' };
  const SEV_BG    = {
    critical: 'rgba(147,0,10,0.16)',
    warning:  'rgba(251,188,5,0.09)',
    info:     'rgba(173,198,255,0.09)',
  };

  let alertPtr = 0;

  function buildAlertEl (alert) {
    const div = document.createElement('div');
    div.className = `alert-item sev-${alert.sev}`;

    const actHtml = alert.actions.map(a => {
      const cls = a === 'RESOLVE' ? 'resolve' : a === 'DEPLOY' ? 'deploy' : a === 'DISMISS' ? 'dismiss' : 'info-b';
      return `<button class="a-btn ${cls}" onclick="window._resolveAlert(this)">${a}</button>`;
    }).join('');

    div.innerHTML = `
      <span class="alert-sev-badge"
            style="background:${SEV_BG[alert.sev]};color:${SEV_COLOR[alert.sev]}">
        ${alert.sev.toUpperCase()}
      </span>
      <p class="alert-body-text">${alert.text}</p>
      <div class="alert-actions">${actHtml}</div>`;
    return div;
  }

  window._resolveAlert = function (btn) {
    const item = btn.closest('.alert-item');
    if (!item) return;
    item.style.opacity = '0';
    item.style.transform = 'translateX(16px)';
    item.style.transition = 'all 0.28s ease';
    setTimeout(() => item.remove(), 300);
  };

  function renderInitialAlerts () {
    const feed = document.getElementById('alert-feed');
    if (!feed) return;
    feed.innerHTML = '';
    [0, 1, 2].forEach(i => {
      feed.appendChild(buildAlertEl(ALERT_POOL[i % ALERT_POOL.length]));
    });
  }

  function startAlertRotation () {
    setInterval(() => {
      const feed = document.getElementById('alert-feed');
      if (!feed) return;

      alertPtr = (alertPtr + 1) % ALERT_POOL.length;
      const el = buildAlertEl(ALERT_POOL[alertPtr]);
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      el.style.transition = 'none';
      feed.insertBefore(el, feed.firstChild);

      requestAnimationFrame(() => {
        el.style.transition = 'all 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });

      // keep max 4
      while (feed.children.length > 4) feed.removeChild(feed.lastChild);
    }, 5000);
  }

  // ── Bar chart ───────────────────────────────────────────────
  let barHeights = [58, 72, 44, 83, 61, 76, 88, 42, 94, 67];

  function renderBarChart () {
    const svg = document.getElementById('ops-bar-chart');
    if (!svg) return;

    const W = svg.clientWidth || svg.parentElement?.clientWidth || 520;
    const H = 155;
    const n = barHeights.length;
    const gap = 6;
    const barW = Math.floor((W - gap * (n - 1)) / n);

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';

    barHeights.forEach((h, i) => {
      const bh     = Math.max(4, (h / 100) * (H - 10));
      const x      = i * (barW + gap);
      const y      = H - bh;
      const isNew  = i === n - 1;
      const alpha  = isNew ? 1 : 0.38 + (i / n) * 0.55;
      const color  = isNew ? '#4d8efe' : '#adc6ff';

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barW);
      rect.setAttribute('height', bh);
      rect.setAttribute('rx', '4');
      rect.setAttribute('fill', color);
      rect.setAttribute('opacity', alpha);
      svg.appendChild(rect);
    });
  }

  function startBarAnimation () {
    setInterval(() => {
      barHeights.shift();
      barHeights.push(38 + Math.floor(Math.random() * 57));
      renderBarChart();
    }, 3000);
  }

  window._opsBarResize = renderBarChart;

  // ── Zone grid ───────────────────────────────────────────────
  const ZONES = [
    { name: 'Main Concourse',  pct: 88, stewards: '24 / 30', status: 'critical'    },
    { name: 'Dining Pavilion', pct: 94, stewards: '12 / 12', status: 'critical'    },
    { name: 'Grand Arena',     pct: 41, stewards: '48 / 60', status: 'operational' },
    { name: 'Fan Plaza',       pct: 65, stewards: '18 / 20', status: 'warning'     },
  ];

  const ZONE_THEME = {
    critical:    { text: '#ff6b6b', bar: '#ff6b6b', border: '#ff6b6b' },
    warning:     { text: '#fbbc05', bar: '#fbbc05', border: '#fbbc05' },
    operational: { text: '#a2e7ff', bar: '#a2e7ff', border: '#a2e7ff' },
  };

  function buildZoneGrid () {
    const grid = document.getElementById('zone-grid');
    if (!grid) return;
    grid.innerHTML = '';

    ZONES.forEach(zone => {
      const t   = ZONE_THEME[zone.status];
      const card = document.createElement('div');
      card.className = 'zone-card';
      card.style.borderTopColor = t.border;
      card.innerHTML = `
        <div class="zone-name">${zone.name}</div>
        <div class="zone-pct" style="color:${t.text}">${zone.pct}%</div>
        <div class="zone-steward-txt">Steward Count: ${zone.stewards}</div>
        <div class="zone-cap-bar">
          <div class="zone-cap-fill" style="width:${zone.pct}%;background:${t.bar}"></div>
        </div>`;
      card.addEventListener('click', () => openZoneOverlay(zone));
      grid.appendChild(card);
    });
  }

  function openZoneOverlay (zone) {
    const overlay  = document.getElementById('zone-overlay');
    const nameEl   = document.getElementById('overlay-zone-name');
    if (!overlay) return;
    if (nameEl) nameEl.textContent = `Telemetry Feed: ${zone.name}`;
    overlay.classList.add('open');
  }

  function initZoneOverlay () {
    const closeBtn = document.getElementById('overlay-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('zone-overlay')?.classList.remove('open');
      });
    }

    document.querySelectorAll('.team-dispatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orig = btn.style.color;
        btn.style.color       = '#adc6ff';
        btn.style.borderColor = 'rgba(173,198,255,0.3)';
        setTimeout(() => {
          btn.style.color       = '';
          btn.style.borderColor = '';
        }, 1400);
      });
    });

    const authBtn = document.getElementById('authorize-deploy-btn');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        authBtn.textContent       = '✓ DEPLOYMENT AUTHORIZED';
        authBtn.style.background  = 'rgba(74,222,128,0.2)';
        authBtn.style.borderColor = 'rgba(74,222,128,0.4)';
        authBtn.style.color       = '#4ade80';
        setTimeout(() => {
          authBtn.textContent       = 'AUTHORIZE DEPLOYMENT';
          authBtn.style.background  = '';
          authBtn.style.borderColor = '';
          authBtn.style.color       = '';
        }, 2200);
      });
    }
  }

  // ── Live ops clock ──────────────────────────────────────────
  function initOpsClock () {
    const el = document.getElementById('ops-clock');
    const tick = () => {
      const now = new Date();
      if (el) el.textContent = now.toISOString().substr(11, 8) + ' UTC';
    };
    tick();
    setInterval(tick, 1000);
  }

  // ── AI Chat Assistant ──────────────────────────────────────
  function initAIChat() {
    const widget = document.getElementById('ai-chat-widget');
    const toggle = document.getElementById('ai-chat-toggle');
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const body = document.getElementById('ai-chat-body');

    if (!widget || !toggle || !input || !sendBtn || !body) return;

    // Toggle minimize
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      widget.classList.toggle('minimized');
      toggle.querySelector('span').textContent = widget.classList.contains('minimized') ? 'expand_less' : 'expand_more';
    });
    
    widget.querySelector('.ai-chat-header').addEventListener('click', () => {
      if (widget.classList.contains('minimized')) {
        widget.classList.remove('minimized');
        toggle.querySelector('span').textContent = 'expand_more';
      }
    });

    function addMessage(text, side) {
      const msg = document.createElement('div');
      msg.className = `ai-msg ${side}`;
      msg.textContent = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
      return msg;
    }

    function typeWriter(element, text, speed = 30) {
      let i = 0;
      element.textContent = '';
      return new Promise(resolve => {
        function type() {
          if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            body.scrollTop = body.scrollHeight;
            setTimeout(type, speed);
          } else {
            resolve();
          }
        }
        type();
      });
    }

    const responses = [
      "Analyzing sensor mesh data... Total throughput is peaking at Gate C. I recommend redirecting Sector 4 overflow to Gate A.",
      "Weather telemetry suggests a 78% probability of rain in 12 minutes. I've pre-calculated covered routes for 14,000 attendees.",
      "Crowd density in the Dining Pavilion is at 94%. Should I authorize the dispatch of Team Beta for flow stabilization?",
      "Current compute utilization is steady at 31%. AI models are projecting a 15% increase in exit clearance efficiency compared to last event.",
      "Biometric signals indicate high engagement levels in Sector 7. This aligns with the recent score event."
    ];

    async function handleSend() {
      const val = input.value.trim();
      if (!val) return;

      addMessage(val, 'user');
      input.value = '';

      // Show typing indicator
      const indicator = document.createElement('div');
      indicator.className = 'ai-msg bot typing-indicator';
      indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
      body.appendChild(indicator);
      body.scrollTop = body.scrollHeight;

      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));
      indicator.remove();

      const botMsg = addMessage('', 'bot');
      const resp = responses[Math.floor(Math.random() * responses.length)];
      await typeWriter(botMsg, resp);
    }

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // ── Winner Features: Heatmap, Signage ───────────────────
  function initOpsWinnerFeatures() {
    const heatmapBtn = document.getElementById('ops-heatmap-toggle');
    const pushBtn = document.getElementById('signage-push-btn');
    const signageMod = document.getElementById('signage-overlay');
    const signageClose = document.getElementById('signage-close');
    const signageConfirm = document.getElementById('signage-confirm-btn');

    // Heatmap Toggle
    if (heatmapBtn) {
      heatmapBtn.addEventListener('click', () => {
        const isActive = heatmapBtn.classList.toggle('active');
        // Visually change the zone grid to 'heatmap' colors
        document.querySelectorAll('.zone-card').forEach(card => {
          if (isActive) {
            card.dataset.origBorder = card.style.borderTopColor;
            card.style.borderTopColor = '#ff6b6b';
            card.style.background = 'rgba(255,107,107,0.05)';
          } else {
            card.style.borderTopColor = card.dataset.origBorder || '';
            card.style.background = '';
          }
        });
      });
    }

    // Signage Modal
    if (pushBtn && signageMod) {
      pushBtn.addEventListener('click', () => signageMod.classList.add('open'));
      [signageClose, signageConfirm].forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
          if (btn === signageConfirm) {
            signageConfirm.textContent = '✓ BROADCAST LIVE';
            signageConfirm.style.background = '#4ade80';
            setTimeout(() => {
              signageMod.classList.remove('open');
              signageConfirm.textContent = 'BROADCAST TO VENUE';
              signageConfirm.style.background = '';
            }, 1500);
          } else {
            signageMod.classList.remove('open');
          }
        });
      });
      signageMod.addEventListener('click', (e) => {
        if (e.target === signageMod) signageMod.classList.remove('open');
      });
    }

    // ESG Stats Simulation
    const energyEl = document.getElementById('esg-energy');
    const carbonEl = document.getElementById('esg-carbon');
    if (energyEl && carbonEl) {
      setInterval(() => {
        const energy = (142.8 + (Math.random() * 0.5)).toFixed(1);
        const carbon = (4.2 + (Math.random() * 0.1)).toFixed(1);
        energyEl.textContent = `${energy} MWh`;
        carbonEl.textContent = `${carbon} Tons`;
      }, 3000);
    }
  }

  // ── Boot ───────────────────────────────────────────────────
  function boot () {
    renderInitialAlerts();
    startAlertRotation();
    renderBarChart();
    startBarAnimation();
    buildZoneGrid();
    initZoneOverlay();
    initOpsClock();
    initAIChat();
    initOpsWinnerFeatures();

    // Rerender chart on window resize
    window.addEventListener('resize', renderBarChart);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
