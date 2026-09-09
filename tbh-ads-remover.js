(function() {
  'use strict';
/*
 * © 2026 @nice_osei
 *
 * This script only removes advertisements from the user's screen
 * for a cleaner viewing experience and does not support or encourage
 * any illegal activity.
 */
  if (!window.__AD_REMOVER__) {
    window.__AD_REMOVER__ = {};
  }
  console.log('[AD BLOCKER] Loaded by @nice_osei');

  const STORAGE_KEY = '__AD_REMOVER_WORDS__';
  const DEFAULT_WORDS = ["sроnsоrеd", "Sроnsоrеd", "SРОNSОRЕD"];

  function getSavedWords() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_WORDS;
  }

  let WORDS = getSavedWords();

  // Unicode/look-alike characters normalize
  function normalize(str) {
    if (!str) return '';
    str = String(str).normalize('NFKC').toLowerCase();

    // Common Cyrillic/Greek look-alikes
    const map = {
      'а':'a','А':'a',
      'е':'e','Е':'e',
      'о':'o','О':'o',
      'р':'p','Р':'p',
      'с':'c','С':'c',
      'х':'x','Х':'x',
      'у':'y','У':'y',
      'і':'i','І':'i',
      'ј':'j','Ј':'j',
      'ѕ':'s','Ѕ':'s',
      'ѵ':'v','Ѵ':'v',
      'к':'k','К':'k',
      'м':'m','М':'m',
      'т':'t','Т':'t',
      'в':'b','В':'b',
      'н':'h','Н':'h',
      'д':'d','Д':'d',
      'г':'r','Г':'r',
      'ј':'j','Ј':'j',
      'ο':'o','Ο':'o',
      'ι':'i','Ι':'i',
      'ν':'v','Ν':'v',
      'χ':'x','Χ':'x',
      'ρ':'p','Ρ':'p'
    };

    let out = '';
    for (const c of str) {
      out += map[c] || c;
    }

    return out
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  let NORMALIZED_WORDS = WORDS
    .map(normalize)
    .filter(Boolean);

  function matches(text) {
    const value = normalize(text);
    if (!value) return 0;

    let count = 0;

    for (const word of NORMALIZED_WORDS) {
      if (value.includes(word)) count++;
    }

    return count;
  }

  function hideElement(el) {
    if (!el || el === document.body || el === document.documentElement) {
      return;
    }

    if (el.dataset.__adRemoved === '1') return;

    el.dataset.__adRemoved = '1';

    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('height', '0', 'important');
    el.style.setProperty('min-height', '0', 'important');
    el.style.setProperty('max-height', '0', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
    el.setAttribute('aria-hidden', 'true');
  }

  function findBestContainer(node) {
    let current = node;
    let best = node;
    let bestScore = 0;

    for (let level = 0; current && level < 8; level++) {

      if (current === document.body || current === document.documentElement) {
        break;
      }

      const text = current.innerText || current.textContent || '';
      const count = matches(text);

      if (count >= 2) {
        const rect = current.getBoundingClientRect();
        const area = Math.max(1, rect.width * rect.height);

        let score = count * 100;

        // Prefer visible reasonable-sized containers
        if (rect.width > 100 && rect.height > 50) score += 20;
        if (area < window.innerWidth * window.innerHeight * 0.9) score += 10;

        // Prefer containers containing images/buttons
        if (current.querySelector('img')) score += 15;
        if (current.querySelector('button,a')) score += 10;

        if (score > bestScore) {
          best = current;
          bestScore = score;
        }
      }

      current = current.parentElement;
    }

    return best;
  }

  function scan(root) {
    if (!root) return;

    if (root.id === '__ad_remover_ui_host__' || (root.closest && root.closest('#__ad_remover_ui_host__'))) {
      return;
    }

    const elements = [];

    if (root.nodeType === 1) elements.push(root);

    if (root.querySelectorAll) {
      elements.push(...root.querySelectorAll(
        'div,section,article,aside,header,footer,span,p,h1,h2,h3,h4,h5,h6,a,button,img'
      ));
    }

    const candidates = [];

    const seen = new Set();

    for (const el of elements) {
      if (!el || seen.has(el)) continue;
      seen.add(el);

      if (el.dataset.__adRemoved === '1') continue;

      const text = el.innerText || el.textContent || '';
      if (!text.trim()) continue;

      const count = matches(text);

      // At least one ad word must match
      if (count > 0) {
        candidates.push({el: el, count: count});
      }
    }

    for (const candidate of candidates) {
      const el = candidate.el;

      if (!el.isConnected) continue;

      const container = findBestContainer(el);

      if (container && container !== document.body) {
        hideElement(container);
      } else {
        hideElement(el);
      }
    }
  }

  // --- DRAGGABLE FLOATING ICON & GLASS DIALOG UI ---
  function initUI() {
    if (document.getElementById('__ad_remover_ui_host__')) return;

    const host = document.createElement('div');
    host.id = '__ad_remover_ui_host__';

    /*
     * UI rendering fix:
     * Keep the host completely independent from the page's
     * normal layout and stacking contexts.
     */
    host.style.setProperty('position', 'fixed', 'important');
    host.style.setProperty('left', '0', 'important');
    host.style.setProperty('top', '0', 'important');
    host.style.setProperty('width', '100vw', 'important');
    host.style.setProperty('height', '100vh', 'important');
    host.style.setProperty('margin', '0', 'important');
    host.style.setProperty('padding', '0', 'important');
    host.style.setProperty('border', '0', 'important');
    host.style.setProperty('background', 'transparent', 'important');
    host.style.setProperty('pointer-events', 'none', 'important');
    host.style.setProperty('z-index', '2147483647', 'important');
    host.style.setProperty('display', 'block', 'important');
    host.style.setProperty('visibility', 'visible', 'important');
    host.style.setProperty('opacity', '1', 'important');
    host.style.setProperty('transform', 'none', 'important');
    host.style.setProperty('contain', 'none', 'important');

    const shadow = host.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: none !important;
          z-index: 2147483647 !important;
          transform: none !important;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .fab-button {
          pointer-events: auto;
          position: fixed !important;
          left: auto;
          top: auto;
          bottom: 24px !important;
          right: 24px !important;

          width: 52px !important;
          height: 52px !important;
          min-width: 52px !important;
          min-height: 52px !important;
          max-width: 52px !important;
          max-height: 52px !important;

          margin: 0 !important;
          padding: 0 !important;

          border-radius: 50%;
          background: rgba(30, 41, 59, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), 0 0 15px rgba(59, 130, 246, 0.25);

          display: flex !important;
          align-items: center;
          justify-content: center;

          cursor: grab;
          user-select: none;
          touch-action: none;

          visibility: visible !important;
          opacity: 1 !important;
          overflow: visible !important;

          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .fab-button:active {
          cursor: grabbing;
        }

        .fab-button svg {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          min-height: 24px !important;

          margin: 0 !important;
          padding: 0 !important;

          fill: none;
          stroke: #60a5fa;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));

          pointer-events: none;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .dialog-backdrop {
          pointer-events: auto;
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;

          margin: 0 !important;
          padding: 20px;

          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);

          display: flex;
          align-items: center;
          justify-content: center;

          opacity: 0;
          visibility: hidden;

          transition:
            opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0.3s;

          z-index: 2147483647 !important;
        }

        .dialog-backdrop.active {
          opacity: 1;
          visibility: visible;
        }

        .dialog-box {
          position: relative;
          width: 100%;
          max-width: 360px;
          background: rgba(18, 24, 38, 0.85);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transform: scale(0.85) translateY(20px);
          transition: transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
        }

        .dialog-backdrop.active .dialog-box {
          transform: scale(1) translateY(0);
        }

        .dialog-copyright {
          font-size: 11px;
          color: #64748b;
          margin: 0 0 10px 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .dialog-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .dialog-header svg {
          width: 20px;
          height: 20px;
          stroke: #38bdf8;
          stroke-width: 2;
          fill: none;
        }

        .dialog-header h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 600;
          color: #f8fafc;
          letter-spacing: 0.3px;
        }

        .dialog-desc {
          margin: 0 0 14px 0;
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.4;
        }

        textarea {
          width: 100%;
          height: 90px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          color: #f1f5f9;
          font-size: 13px;
          line-height: 1.5;
          resize: none;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
        }

        .action-row {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        button {
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-close {
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .btn-close:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
        }

        .btn-save {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }

        .btn-save:hover {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
          transform: translateY(-1px);
        }

        .btn-save:active {
          transform: translateY(0);
        }
      </style>

      <div class="fab-button" id="fab">
        <svg viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
      </div>

      <div class="dialog-backdrop" id="backdrop">
        <div class="dialog-box" id="dialogBox">
          <div class="dialog-copyright">© 2026 @nice_osei • All Rights Reserved</div>
          <div class="dialog-header">
            <svg viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <h3>Filter Keywords</h3>
          </div>
          <p class="dialog-desc">Enter words separated by comma (,):</p>
          <textarea id="wordInput" placeholder="sponsored, ads, promoted..."></textarea>
          <div class="action-row">
            <button class="btn-close" id="closeBtn">Close</button>
            <button class="btn-save" id="saveBtn">Save</button>
          </div>
        </div>
      </div>
    `;

    (document.body || document.documentElement).appendChild(host);

    const fab = shadow.getElementById('fab');
    const backdrop = shadow.getElementById('backdrop');
    const dialogBox = shadow.getElementById('dialogBox');
    const textarea = shadow.getElementById('wordInput');
    const saveBtn = shadow.getElementById('saveBtn');
    const closeBtn = shadow.getElementById('closeBtn');

    function openModal() {
      textarea.value = WORDS.join(', ');
      backdrop.classList.add('active');
    }

    function closeModal() {
      backdrop.classList.remove('active');
    }

    closeBtn.onclick = closeModal;

    backdrop.onclick = (e) => {
      if (e.target === backdrop) closeModal();
    };

    dialogBox.onclick = (e) => {
      e.stopPropagation();
    };

    saveBtn.onclick = function() {
      const text = textarea.value;

      const parsedArray = text
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0);

      WORDS = parsedArray.length > 0 ? parsedArray : DEFAULT_WORDS;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(WORDS));
      NORMALIZED_WORDS = WORDS.map(normalize).filter(Boolean);

      closeModal();
      scan(document.body);
    };

    // --- DRAG & MOVE LOGIC ---
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let moved = false;

    function onPointerDown(e) {
      isDragging = true;
      moved = false;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      startX = clientX;
      startY = clientY;

      const rect = fab.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      // Fix initial right/bottom styles to absolute positions
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.left = initialLeft + 'px';
      fab.style.top = initialTop + 'px';

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        moved = true;
      }

      let nextX = initialLeft + dx;
      let nextY = initialTop + dy;

      // Keep inside screen viewport
      const maxLeft = window.innerWidth - fab.offsetWidth - 10;
      const maxTop = window.innerHeight - fab.offsetHeight - 10;

      nextX = Math.max(10, Math.min(nextX, maxLeft));
      nextY = Math.max(10, Math.min(nextY, maxTop));

      fab.style.left = nextX + 'px';
      fab.style.top = nextY + 'px';
    }

    function onPointerUp(e) {
      if (!isDragging) return;

      isDragging = false;

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Open only on clean tap/click
      if (!moved) {
        openModal();
      }
    }

    fab.addEventListener('pointerdown', onPointerDown);
  }

  function start() {
    initUI();
    scan(document.body);

    setInterval(function() {
      scan(document.body);
    }, 300);

    if (window.__AD_REMOVER__.observer) {
      window.__AD_REMOVER__.observer.disconnect();
    }

    let timer = null;

    window.__AD_REMOVER__.observer = new MutationObserver(function(mutations) {
      if (timer) clearTimeout(timer);

      timer = setTimeout(function() {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) scan(node);
          }
        }
      }, 30);
    });

    window.__AD_REMOVER__.observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  let initialized = false;

  window.adsblocker = {
    init: function() {
      if (initialized) return;

      initialized = true;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, {once:true});
      } else {
        start();
      }
    }
  };

})();
