// screen4-arch.js — Architecture screen logic

(function () {

  // ── Node spec data ──────────────────────────────────────────
  const NODES = {
    'mobile-sdk': {
      badge: 'ACTIVE EDGE',
      title: 'Mobile SDK',
      sub:   'Deployed on iOS & Android · React Native + Edge-Native modules',
      compute: 12,
      stats: [
        { lbl: 'Runtime',   val: 'React Native v0.73' },
        { lbl: 'Proximity', val: 'BLE + UWB Dual-band' },
        { lbl: 'Latency',   val: '< 80ms p95' },
        { lbl: 'Coverage',  val: '99.2% of venue' },
      ],
      pills: ['80ms Latency', '99.2% Coverage', 'AES-256'],
    },
    'ops-console': {
      badge: 'LIVE CONTROLLER',
      title: 'Ops Console',
      sub:   'High-fidelity spatial dashboard · v4.2.0-STABLE · SOC-2 Type II',
      compute: 64,
      stats: [
        { lbl: 'Runtime',  val: 'Kubernetes v1.28' },
        { lbl: 'Security', val: 'SOC-2 Type II' },
        { lbl: 'Latency',  val: '2.4ms' },
        { lbl: 'Uptime',   val: '99.99%' },
      ],
      pills: ['2.4ms Latency', '99.99% Uptime', 'AES-256'],
    },
    'public-api': {
      badge: 'INTEGRATION HUB',
      title: 'Public API Gateway',
      sub:   'GraphQL + REST + Webhooks · OAuth 2.0 · mTLS',
      compute: 38,
      stats: [
        { lbl: 'Protocol',   val: 'GraphQL + REST' },
        { lbl: 'Auth',       val: 'OAuth 2.0 + JWT' },
        { lbl: 'Rate Limit', val: '10k req/min' },
        { lbl: 'SLA',        val: '99.95% uptime' },
      ],
      pills: ['10k req/min', '99.95% SLA', 'mTLS'],
    },
    'logic-engine': {
      badge: 'PROCESSING CORE',
      title: 'Logic Engine',
      sub:   'AI Prediction Core · 7 ensemble ML models · 14-min window',
      compute: 78,
      stats: [
        { lbl: 'Runtime',  val: 'Kubernetes v1.28' },
        { lbl: 'Security', val: 'SOC-2 Type II' },
        { lbl: 'Window',   val: '14-min prediction' },
        { lbl: 'Models',   val: '7 ensemble models' },
      ],
      pills: ['14-min window', '99.99% Uptime', 'AES-256'],
    },
    'telemetry-lake': {
      badge: 'INTELLIGENCE STORAGE',
      title: 'Telemetry Lake',
      sub:   'Apache Kafka + ClickHouse · 1.2 PB/s ingestion · 4ms latency',
      compute: 84,
      stats: [
        { lbl: 'Ingestion',  val: '1.2 PB/s peak' },
        { lbl: 'Latency',    val: '4ms E2E' },
        { lbl: 'Retention',  val: '90d hot / 5yr cold' },
        { lbl: 'Encryption', val: 'AES-256-GCM at rest' },
      ],
      pills: ['4ms Latency', '1.2 PB/s', 'ClickHouse'],
    },
    'lidar': {
      badge: 'PHYSICAL LAYER',
      title: 'LiDAR Grid',
      sub:   '8,000 active sensing units · 30m range · 20Hz scan rate',
      compute: 42,
      stats: [
        { lbl: 'Units',   val: '8,000 active' },
        { lbl: 'Range',   val: '30m per unit' },
        { lbl: 'Refresh', val: '20Hz scan rate' },
        { lbl: 'Power',   val: 'PoE, 8W each' },
      ],
      pills: ['20Hz scan', '8k Units', 'Edge-AI'],
    },
    'cv': {
      badge: 'EDGE-AI OPTIMIZED',
      title: 'Computer Vision',
      sub:   '340 cameras · NVIDIA Jetson Orin NX · < 50ms on-device inference',
      compute: 71,
      stats: [
        { lbl: 'Cameras',   val: '340 wide-angle' },
        { lbl: 'AI Chip',   val: 'Jetson Orin NX' },
        { lbl: 'Inference', val: '< 50ms on-device' },
        { lbl: 'Privacy',   val: 'No face data stored' },
      ],
      pills: ['< 50ms', '340 Cameras', 'No PII'],
    },
    'ble': {
      badge: 'PRECISION POSITIONING',
      title: 'BLE Beacons',
      sub:   'Placed every 15m · Bluetooth 5.3 · 3-year battery · anonymous only',
      compute: 22,
      stats: [
        { lbl: 'Density',  val: 'Every 15m' },
        { lbl: 'Battery',  val: '3 years' },
        { lbl: 'Protocol', val: 'Bluetooth 5.3' },
        { lbl: 'Privacy',  val: 'Anonymous MAC' },
      ],
      pills: ['BT 5.3', '3yr Battery', 'Anonymous'],
    },
    'mesh': {
      badge: 'FAIL-SAFE NETWORK',
      title: 'Mesh Gateways',
      sub:   '128 gateway nodes · 10Gbps each · < 200ms auto-failover · N+2 redundancy',
      compute: 35,
      stats: [
        { lbl: 'Nodes',      val: '128 gateway nodes' },
        { lbl: 'Bandwidth',  val: '10Gbps per node' },
        { lbl: 'Failover',   val: '< 200ms auto' },
        { lbl: 'Redundancy', val: 'N+2 per zone' },
      ],
      pills: ['10Gbps', '< 200ms failover', 'N+2'],
    },
  };

  let selectedNode = 'ops-console';

  function updateDeepDive (nodeId) {
    const data = NODES[nodeId];
    if (!data) return;

    const card = document.getElementById('deep-dive-card');
    if (!card) return;

    card.style.opacity = '0';
    card.style.transition = 'opacity 0.15s ease';

    setTimeout(() => {
      document.getElementById('dd-badge').textContent  = data.badge;
      document.getElementById('dd-title').textContent  = data.title;
      document.getElementById('dd-sub').textContent    = data.sub;

      const statsEl = document.getElementById('dd-stats');
      if (statsEl) {
        statsEl.innerHTML = data.stats.map(s => `
          <div class="dd-stat-cell">
            <div class="dd-stat-lbl">${s.lbl}</div>
            <div class="dd-stat-val">${s.val}</div>
          </div>`).join('');
      }

      const fillEl  = document.getElementById('dd-compute-fill');
      const lblEl   = document.getElementById('dd-compute-lbl');
      if (fillEl)  fillEl.style.width = data.compute + '%';
      if (lblEl)   lblEl.textContent  = `COMPUTE UTILIZATION — ${data.compute}%`;

      const pillsEl = document.getElementById('dd-pills');
      if (pillsEl) {
        pillsEl.innerHTML = data.pills.map(p => `<span class="dd-pill">${p}</span>`).join('');
      }

      card.style.opacity   = '1';
      card.style.transition = 'opacity 0.25s ease';
    }, 160);
  }

  function initArchitecture () {
    document.querySelectorAll('.arch-node').forEach(node => {
      node.addEventListener('click', () => {
        document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');
        selectedNode = node.dataset.node;
        updateDeepDive(selectedNode);
      });
    });

    // Initial state
    const initNode = document.querySelector(`.arch-node[data-node="${selectedNode}"]`);
    if (initNode) initNode.classList.add('selected');
    updateDeepDive(selectedNode);
  }

  window._archInit = initArchitecture;

  document.addEventListener('DOMContentLoaded', initArchitecture);
})();
