// nav.js — Tab switching + sidebar + footer clock

const SCREENS = ['attendee', 'ops', 'simulator', 'architecture', 'impact'];

window.switchScreen = function (screenId) {
  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.screen === screenId);
  });

  // Show/hide sections
  SCREENS.forEach(s => {
    const el = document.getElementById(`screen-${s}`);
    if (!el) return;
    el.classList.remove('active');
    el.style.display = 'none';
  });

  const active = document.getElementById(`screen-${screenId}`);
  if (active) {
    active.classList.add('active');
    // Attendee uses flex; everything else uses block
    active.style.display = screenId === 'attendee' ? 'flex' : 'block';
  }

  // Trigger screen-specific init hooks (in case of deferred rendering)
  if (screenId === 'ops')          window._opsBarResize && window._opsBarResize();
  if (screenId === 'simulator')    window._simChartInit && window._simChartInit();
  if (screenId === 'impact')       window._radarInit    && window._radarInit();
  if (screenId === 'architecture') window._archInit     && window._archInit();
};

function initNav () {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchScreen(tab.dataset.screen));
  });

  // Sidebar items — also switch screen
  document.querySelectorAll('.sidebar-item[data-screen]').forEach(item => {
    item.addEventListener('click', () => switchScreen(item.dataset.screen));
  });

  // Sidebar item active state
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Emergency override modal
  const emergBtn = document.getElementById('emergency-btn');
  const emergMod = document.getElementById('emergency-overlay');
  const emergClose = document.getElementById('emergency-close');
  const emergCancel = document.getElementById('emergency-cancel');
  const emergConfirm = document.getElementById('emergency-confirm');

  if (emergBtn && emergMod) {
    emergBtn.addEventListener('click', () => {
      // Flash button effect
      emergBtn.style.background = 'rgba(147,0,10,0.6)';
      emergBtn.style.boxShadow = '0 0 20px rgba(255,107,107,0.3)';
      setTimeout(() => {
        emergBtn.style.background = '';
        emergBtn.style.boxShadow = '';
      }, 400);
      
      // Open modal
      setTimeout(() => emergMod.classList.add('open'), 200);
    });

    [emergClose, emergCancel].forEach(b => {
      if (b) b.addEventListener('click', () => emergMod.classList.remove('open'));
    });

      if (emergConfirm) {
        emergConfirm.addEventListener('click', () => {
          emergMod.classList.remove('open');
          
          // Critical Toast
          const toast = document.createElement('div');
          toast.className = 'settings-toast animate-fade-in-up';
          toast.style.background = 'rgba(147,0,10,0.2)';
          toast.style.borderColor = 'rgba(255,107,107,0.5)';
          toast.style.color = 'var(--error)';
          toast.innerHTML = `<span class="material-symbols-outlined pulse-red-dot" style="margin-right:8px;font-size:16px"></span> FULL VENUE LOCKDOWN INITIATED`;
          document.body.appendChild(toast);
          
          // Flash entire screen red briefly
          const flash = document.createElement('div');
          flash.style.position = 'fixed';
          flash.style.inset = '0';
          flash.style.background = 'rgba(147,0,10,0.4)';
          flash.style.zIndex = '9999';
          flash.style.pointerEvents = 'none';
          flash.style.transition = 'opacity 1.5s ease';
          document.body.appendChild(flash);

          // Voice Alert
          if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance("Warning. Critical emergency protocol initiated. Full venue lockdown in effect.");
            msg.rate = 0.9;
            window.speechSynthesis.speak(msg);
          }

          // TRIGGER ATTENDEE SAFETY ALERT (WINNER FEATURE)
          if (window.triggerAttendeeSafetyAlert) {
            window.triggerAttendeeSafetyAlert();
          }

          setTimeout(() => {
            flash.style.opacity = '0';
            toast.style.opacity = '0';
            setTimeout(() => { flash.remove(); toast.remove(); }, 1500);
          }, 5000);
        });
      }

    emergMod.addEventListener('click', (e) => {
      if (e.target === emergMod) emergMod.classList.remove('open');
    });
  }

  // Footer clock
  const footerTime = document.getElementById('footer-time');
  function tickFooter () {
    const now = new Date();
    const hms = now.toISOString().substr(11, 8);
    if (footerTime) footerTime.textContent = hms + ' UTC';
  }
  tickFooter();
  setInterval(tickFooter, 1000);

  // Logo click → attendee
  const logo = document.getElementById('navbar-logo');
  if (logo) logo.addEventListener('click', () => switchScreen('attendee'));

  // Default screen
  switchScreen('attendee');

  // Setup dropdowns and modals
  setupPanels();
}

function setupPanels() {
  const notifBtn     = document.getElementById('notif-btn');
  const notifDrop    = document.getElementById('notif-dropdown');
  const settingsBtn  = document.getElementById('settings-btn');
  const settingsMod  = document.getElementById('settings-overlay');
  const avatarBtn    = document.getElementById('avatar-btn');
  const profileDrop  = document.getElementById('profile-dropdown');
  const liveBtn      = document.getElementById('live-pill-btn');
  const liveDrop     = document.getElementById('live-dropdown');

  const allDrops = [notifDrop, profileDrop, liveDrop];

  function closeAllDrops() {
    allDrops.forEach(d => d && d.classList.remove('open'));
  }

  // Toggles
  if (notifBtn && notifDrop) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOp = notifDrop.classList.contains('open');
      closeAllDrops();
      if (!isOp) notifDrop.classList.add('open');
      // Hide red dot when opening
      const dot = notifBtn.querySelector('.notif-badge-dot');
      if (dot) dot.classList.add('hidden');
    });
  }

  if (avatarBtn && profileDrop) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOp = profileDrop.classList.contains('open');
      closeAllDrops();
      if (!isOp) profileDrop.classList.add('open');
    });
  }

  if (liveBtn && liveDrop) {
    liveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOp = liveDrop.classList.contains('open');
      closeAllDrops();
      if (!isOp) liveDrop.classList.add('open');
    });
  }

  // Close drops on outside click
  document.addEventListener('click', (e) => {
    if (notifDrop && !notifDrop.contains(e.target)) notifDrop.classList.remove('open');
    if (profileDrop && !profileDrop.contains(e.target)) profileDrop.classList.remove('open');
    if (liveDrop && !liveDrop.contains(e.target)) liveDrop.classList.remove('open');
  });

  // Prevent closing when clicking inside
  allDrops.forEach(d => {
    if (d) d.addEventListener('click', e => e.stopPropagation());
  });

  // Settings Modal
  if (settingsBtn && settingsMod) {
    settingsBtn.addEventListener('click', () => {
      closeAllDrops();
      settingsMod.classList.add('open');
    });
  }
  const setClose = document.getElementById('settings-close');
  const setCancel= document.getElementById('settings-cancel');
  const setSave  = document.getElementById('settings-save');

  [setClose, setCancel].forEach(b => {
    if (b) b.addEventListener('click', () => settingsMod.classList.remove('open'));
  });

  // Close modal on outside click
  if (settingsMod) {
    settingsMod.addEventListener('click', (e) => {
      if (e.target === settingsMod) settingsMod.classList.remove('open');
    });
  }

  // Footer Modals (API, Security, Audit)
  const apiBtn = document.getElementById('footer-btn-api');
  const apiMod = document.getElementById('api-overlay');
  const apiClose = document.getElementById('api-close');

  const secBtn = document.getElementById('footer-btn-sec');
  const secMod = document.getElementById('sec-overlay');
  const secClose = document.getElementById('sec-close');

  const auditBtn = document.getElementById('footer-btn-audit');
  const auditMod = document.getElementById('audit-overlay');
  const auditClose = document.getElementById('audit-close');

  function setupModal(btn, mod, closeBtn) {
    if (btn && mod) {
      btn.addEventListener('click', () => {
        closeAllDrops();
        mod.classList.add('open');
      });
      if (closeBtn) {
        closeBtn.addEventListener('click', () => mod.classList.remove('open'));
      }
      mod.addEventListener('click', (e) => {
        if (e.target === mod) mod.classList.remove('open');
      });
    }
  }

  setupModal(apiBtn, apiMod, apiClose);
  setupModal(secBtn, secMod, secClose);
  setupModal(auditBtn, auditMod, auditClose);

  // Settings Save Toast
  if (setSave) {
    setSave.addEventListener('click', () => {
      settingsMod.classList.remove('open');
      const toast = document.createElement('div');
      toast.className = 'settings-toast animate-fade-in-up';
      toast.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Settings updated successfully`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    });
  }

  // Mark all read
  const markRead = document.getElementById('mark-all-read');
  if (markRead) {
    markRead.addEventListener('click', () => {
      document.querySelectorAll('.nbd-item.unread').forEach(item => {
        item.classList.remove('unread');
      });
    });
  }

  // Logout overrides (re-bind to show login screen)
  const logout = document.getElementById('profile-logout');
  if (logout) {
    logout.replaceWith(logout.cloneNode(true)); // remove old listener
    const newLogout = document.getElementById('profile-logout');
    newLogout.addEventListener('click', () => {
      profileDrop.classList.remove('open');
      const loginScreen = document.getElementById('login-screen');
      const appShell = document.getElementById('app-shell');
      if (loginScreen && appShell) {
        // Reset app shell
        appShell.style.opacity = '0';
        setTimeout(() => {
          appShell.style.display = 'none';
          // Show login screen
          loginScreen.style.display = 'flex';
          setTimeout(() => loginScreen.style.opacity = '1', 50);
          
          // Reset login inputs and button
          const btnText = document.querySelector('#login-btn .btn-text');
          const btnSpin = document.querySelector('#login-btn .btn-spinner');
          if (btnText) btnText.style.display = 'inline';
          if (btnSpin) btnSpin.style.display = 'none';
        }, 500);
      }
    });
  }
}

// ════════════════════════════════════════════════
// LOGIN & VENUE SELECTION LOGIC
// ════════════════════════════════════════════════
function initLogin() {
  const loginBtn = document.getElementById('login-btn');
  const loginScreen = document.getElementById('login-screen');
  const venueScreen = document.getElementById('venue-select-screen');
  const appShell = document.getElementById('app-shell');
  
  const btnText = document.querySelector('#login-btn .btn-text');
  const btnSpin = document.querySelector('#login-btn .btn-spinner');

  // 1. Authenticate -> Show Venue Selection
  if (loginBtn && loginScreen && venueScreen) {
    loginBtn.addEventListener('click', () => {
      // Show spinner
      if (btnText) btnText.style.display = 'none';
      if (btnSpin) btnSpin.style.display = 'inline-block';
      
      // Simulate auth delay
      setTimeout(() => {
        // Fade out login
        loginScreen.style.opacity = '0';
        setTimeout(() => {
          loginScreen.style.display = 'none';
          
          // Fade in venue selection
          venueScreen.style.display = 'flex';
          setTimeout(() => {
            venueScreen.style.opacity = '1';
          }, 50);
          
        }, 500);
      }, 1200); // 1.2s auth delay
    });
  }

  // 2. Connect Venue -> Show Dashboard
  const connectBtns = document.querySelectorAll('.vs-card:not(.inactive) .vs-connect-btn');
  connectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const vText = btn.querySelector('.vs-btn-text');
      const vSpin = btn.querySelector('.vs-btn-spinner');
      
      // Show spinner
      if (vText) vText.style.display = 'none';
      if (vSpin) vSpin.style.display = 'inline-block';
      
      // Simulate connection delay
      setTimeout(() => {
        // Fade out venue map
        venueScreen.style.opacity = '0';
        setTimeout(() => {
          venueScreen.style.display = 'none';
          
          // Fade in shell
          if (appShell) {
            appShell.style.display = 'block';
            switchScreen('attendee');
            
            setTimeout(() => {
              appShell.style.opacity = '1';
            }, 50);
          }
          
        }, 500);
      }, 1500); // 1.5s connection delay
    });
  });

  // 3. Provision New Venue
  const addVenueBtn = document.getElementById('add-venue-btn');
  const newVenueMod = document.getElementById('new-venue-overlay');
  const cancelNewVenue = document.getElementById('new-venue-cancel');
  const closeNewVenue = document.getElementById('new-venue-close');
  const deployNewVenue = document.getElementById('new-venue-deploy');

  if (addVenueBtn && newVenueMod) {
    addVenueBtn.addEventListener('click', () => {
      newVenueMod.classList.add('open');
    });

    [cancelNewVenue, closeNewVenue].forEach(btn => {
      if (btn) btn.addEventListener('click', () => newVenueMod.classList.remove('open'));
    });

    if (deployNewVenue) {
      deployNewVenue.addEventListener('click', () => {
        newVenueMod.classList.remove('open');
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'settings-toast animate-fade-in-up';
        toast.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Venue Provisioning Workflow Initiated`;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      });
    }

    newVenueMod.addEventListener('click', (e) => {
      if (e.target === newVenueMod) newVenueMod.classList.remove('open');
    });
    
    // Live update range sliders
    const sliders = newVenueMod.querySelectorAll('.slider-inp');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const display = e.target.previousElementSibling.querySelector('span:last-child');
        if (display) {
          const val = parseInt(e.target.value).toLocaleString();
          display.textContent = val;
        }
      });
    });
  }
}

// ════════════════════════════════════════════════
// COMMAND PALETTE LOGIC
// ════════════════════════════════════════════════
function initCommandPalette() {
  const backdrop = document.getElementById('cmd-palette-backdrop');
  const input = document.getElementById('cmd-input');
  const resultsContainer = document.getElementById('cmd-results');
  
  if (!backdrop || !input || !resultsContainer) return;

  const commands = [
    { id: 'nav-attendee', icon: 'smartphone', title: 'Open Fan Experience', desc: 'Navigate to Attendee Companion App', action: () => window.switchScreen('attendee') },
    { id: 'nav-ops', icon: 'radar', title: 'Open Ops Center', desc: 'Navigate to Main Operation Console', action: () => window.switchScreen('ops') },
    { id: 'nav-sim', icon: 'account_tree', title: 'Open Simulator', desc: 'Navigate to Scenario Prediction Engine', action: () => window.switchScreen('simulator') },
    { id: 'nav-roi', icon: 'query_stats', title: 'Open Impact & ROI', desc: 'Navigate to Architecture & ROI', action: () => window.switchScreen('impact') },
    { id: 'lockdown', icon: 'gpp_bad', title: 'Trigger Protocol: Lockdown', desc: 'Initiate Full Venue Emergency Lockdown Override', action: () => document.getElementById('emergency-lockdown-btn')?.click() },
    { id: 'deploy-alpha', icon: 'verified_user', title: 'Dispatch Team Alpha', desc: 'Deploy 8 stewards to Main Concourse', action: () => renderCmdToast('Team Alpha successfully deployed to Sector 04.') },
    { id: 'reset-zones', icon: 'refresh', title: 'Reset Sensor Mesh', desc: 'Force firmware recalibration across all Edge IoT nodes', action: () => renderCmdToast('Sensor mesh reboot sequence initialized.') },
    { id: 'new-venue', icon: 'add', title: 'Provision New Venue', desc: 'Open Integration Wizard for new stadium deployment', action: () => document.getElementById('add-venue-btn')?.click() }
  ];

  let selectedIndex = 0;

  function renderCmdToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'settings-toast animate-fade-in-up';
    toast.innerHTML = `<span class="material-symbols-outlined">check_circle</span> &nbsp;${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  function togglePalette() {
    const isOpen = backdrop.classList.contains('open');
    if (isOpen) {
      backdrop.classList.remove('open');
      input.blur();
    } else {
      backdrop.classList.add('open');
      input.value = '';
      renderResults();
      setTimeout(() => input.focus(), 100);
    }
  }

  function renderResults(query = '') {
    const filtered = commands.filter(cmd => 
      cmd.title.toLowerCase().includes(query.toLowerCase()) || 
      cmd.desc.toLowerCase().includes(query.toLowerCase())
    );
    
    selectedIndex = 0;
    resultsContainer.innerHTML = '';

    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<div style="padding:20px;text-align:center;color:var(--on-surface-variant);font-size:0.875rem">No system commands found...</div>';
      return;
    }

    filtered.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `cmd-item ${idx === 0 ? 'active' : ''}`;
      item.innerHTML = `
        <div class="cmd-item-icon"><span class="material-symbols-outlined">${cmd.icon}</span></div>
        <div class="cmd-item-info">
          <div class="cmd-item-title">${cmd.title}</div>
          <div class="cmd-item-desc">${cmd.desc}</div>
        </div>
      `;
      item.addEventListener('mouseenter', () => {
        const items = resultsContainer.querySelectorAll('.cmd-item');
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        selectedIndex = idx;
      });
      item.addEventListener('click', () => {
        togglePalette();
        cmd.action();
      });
      resultsContainer.appendChild(item);
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      togglePalette();
    }
    
    if (backdrop.classList.contains('open')) {
      if (e.key === 'Escape') {
        togglePalette();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = resultsContainer.querySelectorAll('.cmd-item');
        if (items.length === 0) return;
        
        items[selectedIndex].classList.remove('active');
        if (e.key === 'ArrowDown') {
          selectedIndex = (selectedIndex + 1) % items.length;
        } else {
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        }
        items[selectedIndex].classList.add('active');
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItems = resultsContainer.querySelectorAll('.cmd-item.active');
        if (activeItems.length > 0) {
          activeItems[0].click();
        }
      }
    }
  });

  input.addEventListener('input', (e) => renderResults(e.target.value));

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) togglePalette();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initLogin();
  initCommandPalette();
});
