// screen5-impact.js — Impact & ROI screen logic

(function () {

  // ── Radar chart ─────────────────────────────────────────────
  function drawRadar () {
    const svg = document.getElementById('radar-chart');
    if (!svg) return;

    const cx = 200, cy = 200, r = 145;
    const axes    = ['Intelligence', 'Scalability', 'Reliability', 'Latency', 'Security', 'Autonomy'];
    const vf      = [95, 90, 98, 92, 96, 88];
    const legacy  = [45, 50, 60, 40, 55, 35];
    const n       = axes.length;
    const svgNS   = 'http://www.w3.org/2000/svg';

    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 400 400');

    // Background grid
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      const pts = axes.map((_, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        return [cx + r * scale * Math.cos(a), cy + r * scale * Math.sin(a)].join(',');
      }).join(' ');
      const poly = document.createElementNS(svgNS, 'polygon');
      poly.setAttribute('points', pts);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', 'rgba(255,255,255,0.07)');
      poly.setAttribute('stroke-width', '1');
      svg.appendChild(poly);
    });

    // Axis lines
    axes.forEach((_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', cx + r * Math.cos(a));
      line.setAttribute('y2', cy + r * Math.sin(a));
      line.setAttribute('stroke', 'rgba(255,255,255,0.09)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    });

    // Helper: build polygon points
    function buildPoly (vals) {
      return vals.map((v, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const s = v / 100;
        return [cx + r * s * Math.cos(a), cy + r * s * Math.sin(a)].join(',');
      }).join(' ');
    }

    // Legacy polygon
    const legPoly = document.createElementNS(svgNS, 'polygon');
    legPoly.setAttribute('points', buildPoly(legacy));
    legPoly.setAttribute('fill', 'rgba(255,255,255,0.04)');
    legPoly.setAttribute('stroke', 'rgba(255,255,255,0.22)');
    legPoly.setAttribute('stroke-width', '1.5');
    legPoly.setAttribute('stroke-dasharray', '4,3');
    svg.appendChild(legPoly);

    // VenueFlow polygon
    const vfPoly = document.createElementNS(svgNS, 'polygon');
    vfPoly.setAttribute('points', buildPoly(vf));
    vfPoly.setAttribute('fill', 'rgba(173,198,255,0.14)');
    vfPoly.setAttribute('stroke', '#adc6ff');
    vfPoly.setAttribute('stroke-width', '2');
    svg.appendChild(vfPoly);

    // VenueFlow dots
    vf.forEach((v, i) => {
      const a  = (Math.PI * 2 * i) / n - Math.PI / 2;
      const s  = v / 100;
      const cx2 = cx + r * s * Math.cos(a);
      const cy2 = cy + r * s * Math.sin(a);
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', cx2);
      dot.setAttribute('cy', cy2);
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', '#fbbc05');
      svg.appendChild(dot);
    });

    // Axis labels
    axes.forEach((label, i) => {
      const a    = (Math.PI * 2 * i) / n - Math.PI / 2;
      const dist = r + 26;
      const lx   = cx + dist * Math.cos(a);
      const ly   = cy + dist * Math.sin(a);
      const txt  = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', lx);
      txt.setAttribute('y', ly);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dominant-baseline', 'middle');
      txt.setAttribute('fill', '#c2c6d5');
      txt.setAttribute('font-size', '10');
      txt.setAttribute('font-family', 'Manrope, sans-serif');
      txt.setAttribute('font-weight', '700');
      txt.textContent = label;
      svg.appendChild(txt);
    });
  }

  // ── CTA Buttons Interactive Logic ─────────────────────────────
  function initImpactCTAs() {
    const deployBtn = document.getElementById('impact-deploy-btn');
    const auditBtn = document.getElementById('impact-audit-btn');

    function createGlobalToast(msg, isAlert = false) {
      const toast = document.createElement('div');
      toast.className = 'settings-toast animate-fade-in-up';
      if (isAlert) {
        toast.style.background = 'rgba(173,198,255,0.1)';
        toast.style.borderColor = 'rgba(173,198,255,0.3)';
        toast.style.color = 'var(--primary)';
        toast.innerHTML = `<span class="material-symbols-outlined pulse-green-dot" style="background:#adc6ff; box-shadow:0 0 8px #adc6ff;"></span> &nbsp;${msg}`;
      } else {
        toast.innerHTML = `<span class="material-symbols-outlined">check_circle</span> &nbsp;${msg}`;
      }
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    if (deployBtn) {
      deployBtn.addEventListener('click', () => {
        deployBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite; font-size:16px;">progress_activity</span>&nbsp; Authenticating...';
        setTimeout(() => {
          deployBtn.innerHTML = 'Initiate Global Deployment';
          createGlobalToast('Global Deployment Sequence Initiated Successfully', true);
        }, 1200);
      });
    }

    if (auditBtn) {
      auditBtn.addEventListener('click', () => {
        auditBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite; font-size:16px;">progress_activity</span>&nbsp; Fetching...';
        setTimeout(() => {
          auditBtn.innerHTML = 'Review Technical Audit';
          createGlobalToast('Technical Audit Report compiled and downloaded.');
        }, 800);
      });
    }
  }

  window._radarInit = drawRadar;

  document.addEventListener('DOMContentLoaded', () => {
    drawRadar();
    initImpactCTAs();
  });
})();
