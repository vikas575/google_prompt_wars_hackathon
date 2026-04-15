// screen1-attendee.js — Attendee App logic

(function () {

  // ── Phone toast ─────────────────────────────────────────────
  function showPhoneToast(msg) {
    const frame = document.querySelector('.phone-frame');
    if (!frame) return;

    const existing = frame.querySelector('.phone-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'phone-toast';
    toast.innerHTML = `
      <span class="material-symbols-outlined">check_circle</span>
      <span>${msg}</span>`;
    frame.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  }

  window._showPhoneToast = showPhoneToast;

  // ── Smart Wayfinding Rerouting ──────────────────────────────
  window.triggerMapReroute = function (destination) {
    const path = document.getElementById('wayfinding-path');
    const alert = document.getElementById('routing-alert');
    if (!path) return;

    // Simulate calculating new route
    path.style.opacity = '0.2';
    setTimeout(() => {
      let newD;
      let msg;
      
      if (destination === 'north') {
        newD = "M 30 30 Q 80 110 140 30"; // Different curve
        msg = "Rerouting to North Restrooms (Wait: 02:00)";
      } else {
        newD = "M 30 30 Q 100 -20 170 80"; // Completely bypassed curve
        msg = "Traffic detected. Rerouting via Concourse B...";
      }

      path.setAttribute('d', newD);
      path.style.stroke = "var(--color-green)";
      path.style.opacity = '1';

      if (alert) {
        alert.textContent = msg;
        alert.style.opacity = '1';
        setTimeout(() => alert.style.opacity = '0', 4000);
      }
    }, 400);
  };

  // ── Express Order ───────────────────────────────────────────
  function initOrderBtns() {
    const expressBtn = document.getElementById('express-order-btn');
    if (expressBtn) {
      expressBtn.addEventListener('click', () => {
        expressBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite">progress_activity</span> Processing...';
        setTimeout(() => {
          expressBtn.innerHTML = 'Order Confirmed ✓';
          expressBtn.style.background = 'var(--color-green)';
          expressBtn.style.color = '#000';
          showPhoneToast('Stadium Burger & Beer delivering to 14F in 04:30');
          setTimeout(() => {
            expressBtn.innerHTML = 'Order to Seat — $23.50';
            expressBtn.style.background = 'var(--primary-container)';
            expressBtn.style.color = 'var(--on-primary)';
          }, 6000);
        }, 1200);
      });
    }
  }

  // ── Live clock in phone status bar ─────────────────────────
  function initPhoneClock() {
    const el = document.getElementById('phone-clock');
    if (!el) return;
    const tick = () => {
      const now = new Date();
      el.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    };
    tick();
    setInterval(tick, 30000);
  }

  // ── Phone bottom nav ────────────────────────────────────────
  function initPhoneNav() {
    document.querySelectorAll('.phone-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.phone-nav-item').forEach(i => i.classList.remove('pni-active'));
        item.classList.add('pni-active');
      });
    });
  }

  // ── Winner Features: AR, Heatmap, Safety ──────────────────
  function initWinnerFeatures() {
    const arLaunchBtn = document.getElementById('launch-ar-btn');
    const arOverlay = document.getElementById('phone-ar-overlay');
    const arCloseBtn = document.getElementById('ar-close-btn');
    const heatmapToggle = document.getElementById('phone-heatmap-toggle');
    const mapSvg = document.getElementById('attendee-map-svg');
    const safetyOverlay = document.getElementById('phone-safety-overlay');
    const safetyDismiss = document.getElementById('safety-dismiss-btn');

    // AR Toggle
    if (arLaunchBtn && arOverlay && arCloseBtn) {
      arLaunchBtn.addEventListener('click', () => arOverlay.classList.add('open'));
      arCloseBtn.addEventListener('click', () => arOverlay.classList.remove('open'));
    }

    // Heatmap Toggle
    if (heatmapToggle && mapSvg) {
      heatmapToggle.addEventListener('click', () => {
        const isActive = mapSvg.classList.toggle('heatmap-mode');
        heatmapToggle.style.color = isActive ? 'var(--error)' : 'var(--primary)';
        heatmapToggle.querySelector('.material-symbols-outlined').style.color = isActive ? 'var(--error)' : 'var(--primary)';
      });
    }

    // Accessibility Mode
    const accessToggle = document.getElementById('accessibility-toggle');
    const routineAlert = document.getElementById('routing-alert');
    if (accessToggle) {
      accessToggle.addEventListener('click', () => {
        const isActive = accessToggle.classList.toggle('active');
        if (isActive) {
          accessToggle.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px">check_circle</span> STEP-FREE';
          if (routineAlert) {
            routineAlert.classList.add('step-free-alert');
            routineAlert.textContent = 'Accessibility Mode: Rerouting via Elevators 3/4 (Step-free path).';
            routineAlert.style.opacity = '1';
          }
        } else {
          accessToggle.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px">accessible</span> MODE';
          if (routineAlert) {
            routineAlert.classList.remove('step-free-alert');
            routineAlert.style.opacity = '0';
          }
        }
      });
    }

    // Safety Alert (Global trigger)
    window.triggerAttendeeSafetyAlert = function() {
      if (safetyOverlay) {
        safetyOverlay.classList.add('open');
        // Auto-reroute map to exit
        window.triggerMapReroute && window.triggerMapReroute('exit');
      }
    };

    if (safetyDismiss) {
      safetyDismiss.addEventListener('click', () => safetyOverlay.classList.remove('open'));
    }
  }

  function boot() {
    initOrderBtns();
    initPhoneClock();
    initPhoneNav();
    initWinnerFeatures();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
