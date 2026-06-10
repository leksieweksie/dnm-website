(() => {
  const root = document.documentElement;
  const storageKey = 'dnmDisplaySettings';
  const systemReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const defaults = { darkMode: false, highContrast: false, largeText: false, reduceMotion: false };

  function loadSettings() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') };
    } catch {
      return { ...defaults };
    }
  }

  let settings = loadSettings();

  function isMotionReduced() {
    return settings.reduceMotion || systemReduceMotion.matches || root.classList.contains('dnm-reduce-motion');
  }

  function applySettings() {
    root.classList.toggle('dnm-theme-dark', settings.darkMode);
    root.classList.toggle('dnm-high-contrast', settings.highContrast);
    root.classList.toggle('dnm-large-text', settings.largeText);
    root.classList.toggle('dnm-reduce-motion', settings.reduceMotion || systemReduceMotion.matches);
  }

  function saveSettings() {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    applySettings();
  }

  function createSwitch(key, title, description) {
    const row = document.createElement('label');
    row.className = 'dnm-setting-row';
    row.innerHTML = `
      <span class="dnm-setting-label">
        <strong>${title}</strong>
        <span>${description}</span>
      </span>
      <span class="dnm-switch">
        <input type="checkbox" data-setting="${key}" ${settings[key] ? 'checked' : ''} />
        <span aria-hidden="true"></span>
      </span>
    `;
    return row;
  }

  function mountSettingsPanel() {
    if (document.getElementById('dnmSettingsPanel')) return;

    const toggleIcon = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.04.04a2 2 0 1 1-2.83 2.83l-.04-.04A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6V20a2 2 0 1 1-4 0v-.06a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.04.04a2 2 0 1 1-2.83-2.83l.04-.04A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.06a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.04-.04a2 2 0 1 1 2.83-2.83l.04.04A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.06a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04A1.7 1.7 0 0 0 19.4 9c.22.35.42.68.6 1H20a2 2 0 1 1 0 4h-.06c-.18.32-.38.65-.54 1Z"></path>
      </svg>
    `;

    const createToggle = (extraClass = '') => {
      const toggle = document.createElement('button');
      toggle.className = `dnm-settings-toggle ${extraClass}`.trim();
      toggle.type = 'button';
      toggle.title = 'Display settings';
      toggle.setAttribute('aria-label', 'Open display settings');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'dnmSettingsPanel');
      toggle.innerHTML = toggleIcon;
      return toggle;
    };

    const toggle = createToggle();
    const mobileToggle = createToggle('dnm-settings-toggle-mobile');
    const toggles = [toggle, mobileToggle];
    let activeToggle = toggle;

    const clamp = (value, min, max) => Math.max(min, Math.min(value, Math.max(min, max)));

    const positionPanel = () => {
      const anchor = activeToggle || toggle;
      const rect = anchor.getBoundingClientRect();
      const gap = 10;
      const margin = 12;
      const panelWidth = Math.min(330, window.innerWidth - margin * 2);
      const panelHeight = panel.offsetHeight || 320;
      const left = clamp(rect.right - panelWidth, margin, window.innerWidth - panelWidth - margin);
      let top = rect.bottom + gap;

      if (top + panelHeight > window.innerHeight - margin) {
        top = rect.top - panelHeight - gap;
      }

      panel.style.width = `${panelWidth}px`;
      panel.style.left = `${window.scrollX + left}px`;
      panel.style.right = 'auto';
      panel.style.top = `${window.scrollY + clamp(top, margin, window.innerHeight - panelHeight - margin)}px`;
    };

    const panel = document.createElement('section');
    panel.className = 'dnm-settings-panel';
    panel.id = 'dnmSettingsPanel';
    panel.setAttribute('aria-label', 'Display settings');
    panel.innerHTML = `
      <div class="dnm-settings-head">
        <div class="dnm-settings-title">Display Settings</div>
        <button class="dnm-settings-close" type="button" aria-label="Close settings">&times;</button>
      </div>
    `;
    panel.appendChild(createSwitch('darkMode', 'Dark mode', 'Use a darker page background.'));
    panel.appendChild(createSwitch('highContrast', 'High contrast', 'Make buttons and controls easier to see.'));
    panel.appendChild(createSwitch('largeText', 'Larger text', 'Slightly increase text size.'));
    panel.appendChild(createSwitch('reduceMotion', 'Reduce motion', 'Turn off most animations.'));

    const setOpen = (open, anchor = activeToggle) => {
      activeToggle = anchor || activeToggle;
      if (open) positionPanel();
      panel.classList.toggle('open', open);
      toggles.forEach((button) => button.setAttribute('aria-expanded', String(open)));
      if (open) requestAnimationFrame(positionPanel);
    };

    toggles.forEach((button) => {
      button.addEventListener('click', () => setOpen(!panel.classList.contains('open') || activeToggle !== button, button));
    });
    panel.querySelector('.dnm-settings-close').addEventListener('click', () => setOpen(false));
    panel.addEventListener('change', (event) => {
      const input = event.target.closest('[data-setting]');
      if (!input) return;
      settings[input.dataset.setting] = input.checked;
      saveSettings();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (!panel.classList.contains('open')) return;
      if (panel.contains(event.target) || toggles.some((button) => button.contains(event.target))) return;
      setOpen(false);
    });
    window.addEventListener('resize', () => {
      if (panel.classList.contains('open')) positionPanel();
    }, { passive: true });
    window.addEventListener('scroll', () => {
      if (panel.classList.contains('open')) positionPanel();
    }, { passive: true });

    const desktopJoinButton = document.querySelector('.navbar > div .nav-cta[href="join.html"]');
    if (desktopJoinButton?.parentElement) {
      desktopJoinButton.insertAdjacentElement('afterend', toggle);
    } else {
      document.body.appendChild(toggle);
    }
    document.getElementById('menuBtn')?.insertAdjacentElement('beforebegin', mobileToggle);
    document.body.appendChild(panel);
  }

  applySettings();

  function formatCounterValue(value, decimals, noSuffix) {
    const rounded = decimals > 0
      ? value.toFixed(decimals)
      : Math.floor(value);
    return noSuffix ? String(rounded) : Number(rounded).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function animateCounter(el, target, duration = 1800) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';

    const decimals = Number(el.dataset.decimals || 0);
    const suffix = el.dataset.suffix || '';
    const noSuffix = el.dataset.noSuffix === 'true';

    if (isMotionReduced()) {
      el.textContent = formatCounterValue(target, decimals, noSuffix) + suffix;
      return;
    }

    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCounterValue(eased * target, decimals, noSuffix) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function mountCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach((el) => animateCounter(el, Number(el.dataset.target || 0)));
      return;
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target, Number(entry.target.dataset.target || 0));
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => counterObserver.observe(el));
  }

  function mountSharedUi() {
    mountSettingsPanel();
    mountCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSharedUi, { once: true });
  } else {
    mountSharedUi();
  }

  document.addEventListener('click', (event) => {
    if (isMotionReduced()) return;
    const link = event.target.closest('a[href$=".html"]');
    if (!link) return;

    const href = link.getAttribute('href');
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!href || href.startsWith('#') || isModified || link.target === '_blank') return;

    const nextUrl = new URL(href, window.location.href);
    if (nextUrl.href === window.location.href) return;

    event.preventDefault();
    document.body.classList.add('page-leave');
    window.setTimeout(() => {
      window.location.href = nextUrl.href;
    }, 170);
  });
})();
