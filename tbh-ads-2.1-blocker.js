/*!
 * AdBlocker v2.1
 * © 2026 @nice_osei
 * 
 */
(function (global) {
  'use strict';

  let isRunning = false;
  const STORAGE_KEY = '__AD_REMOVER_WORDS__';
  const STATE_KEY = '__AD_REMOVER_ENABLED__';
  const DEFAULT_WORDS = ["sроnsоrеd", "Sроnsоrеd", "SРОNSОRЕD", "sponsored", "promoted"];

  let isBlockerActive = localStorage.getItem(STATE_KEY) !== 'false';
  let WORDS = [];
  let NORMALIZED_WORDS = [];

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

  function normalize(str) {
    if (!str) return '';
    str = String(str).normalize('NFKC').toLowerCase();
    const map = {
      'а':'a','А':'a','е':'e','Е':'e','о':'o','О':'o',
      'р':'p','Р':'p','с':'c','С':'c','х':'x','Х':'x',
      'у':'y','У':'y','і':'i','І':'i','ј':'j','Ј':'j',
      'ѕ':'s','Ѕ':'s','ѵ':'v','Ѵ':'v','к':'k','К':'k',
      'м':'m','М':'m','т':'t','Т':'t','в':'b','В':'b',
      'н':'h','Н':'h','д':'d','Д':'d','г':'r','Г':'r',
      'ο':'o','Ο':'o','ι':'i','Ι':'i','ν':'v','Ν':'v',
      'χ':'x','Χ':'x','ρ':'p','Ρ':'p'
    };
    let out = '';
    for (const c of str) out += map[c] || c;
    return out.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
  }

  function updateWords(newWords) {
    WORDS = newWords && newWords.length > 0 ? newWords : DEFAULT_WORDS;
    NORMALIZED_WORDS = WORDS.map(normalize).filter(Boolean);
  }

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
    if (!el || el === document.body || el === document.documentElement) return;
    if (el.dataset && el.dataset.__adRemoved === '1') return;

    if (el.dataset) el.dataset.__adRemoved = '1';
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('height', '0', 'important');
    el.setAttribute('aria-hidden', 'true');
  }

  function findBestContainer(node) {
    let current = node;
    let best = node;
    let bestScore = 0;

    for (let level = 0; current && level < 8; level++) {
      if (current === document.body || current === document.documentElement) break;

      const text = current.innerText || current.textContent || '';
      const count = matches(text);

      if (count >= 1) {
        const rect = current.getBoundingClientRect();
        const area = Math.max(1, rect.width * rect.height);
        let score = count * 100;

        if (rect.width > 100 && rect.height > 50) score += 20;
        if (area < window.innerWidth * window.innerHeight * 0.9) score += 10;
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
    if (!isRunning || !isBlockerActive || !root) return;
    
    // নিজের UI বা শ্যাডো হোস্ট যাতে কখনোই রিমুভ না হয়
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

      // UI-এর ভিতরের কোনো উপাদান থাকলে স্ক্যান স্কিপ করবে
      if (el.id === '__ad_remover_ui_host__' || (el.closest && el.closest('#__ad_remover_ui_host__'))) continue;
      if (el.dataset && el.dataset.__adRemoved === '1') continue;

      const text = el.innerText || el.textContent || '';
      if (!text.trim()) continue;

      const count = matches(text);
      if (count > 0) {
        candidates.push({ el: el, count: count });
      }
    }

    for (const candidate of candidates) {
      const el = candidate.el;
      if (!el.isConnected) continue;

      const container = findBestContainer(el);
      if (container && container !== document.body && container.id !== '__ad_remover_ui_host__') {
        hideElement(container);
      } else {
        hideElement(el);
      }
    }
  }

  function initUI() {
    if (document.getElementById('__ad_remover_ui_host__')) return;

    const host = document.createElement('div');
    host.id = '__ad_remover_ui_host__';

    const shadow = host.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host { 
          all: initial; 
          -webkit-tap-highlight-color: transparent;
        }
        * { 
          box-sizing: border-box; 
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        /* Pure Glass FAB */
        .fab {
          position: fixed !important;
          bottom: 30px !important;
          right: 25px !important;
          width: 54px !important;
          height: 54px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          z-index: 2147483647 !important;
          touch-action: none !important;
          user-select: none !important;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .fab:active {
          transform: scale(0.92);
        }
        .fab svg {
          width: 26px;
          height: 26px;
          fill: none;
          stroke: #38bdf8;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          pointer-events: none;
          filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4));
        }

        /* Backdrop with Blur */
        .backdrop {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          z-index: 2147483647 !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;
        }
        .backdrop.open {
          opacity: 1;
          visibility: visible;
        }

        /* Glass Dialog Box (No solid bg) */
        .modal {
          width: 100%;
          max-width: 360px;
          background: rgba(255, 255, 255, 0.05) !important;
          backdrop-filter: blur(30px) saturate(200%) !important;
          -webkit-backdrop-filter: blur(30px) saturate(200%) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
          transform: scale(0.85) translateY(15px);
          transition: transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .backdrop.open .modal {
          transform: scale(1) translateY(0);
        }

        .cr {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .title {
          font-size: 17px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .title svg {
          width: 20px;
          height: 20px;
          stroke: #38bdf8;
          stroke-width: 2;
        }

        /* Modern On/Off Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: 0.3s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 2px;
          bottom: 2px;
          background-color: #ffffff;
          transition: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input:checked + .slider {
          background-color: #0284c7;
          border-color: #38bdf8;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }

        .desc {
          margin: 0 0 14px 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.4;
        }

        /* Glass Input */
        textarea {
          width: 100%;
          height: 85px;
          background: rgba(0, 0, 0, 0.25) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 14px;
          padding: 12px;
          color: #ffffff;
          font-size: 13px;
          resize: none;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        textarea:focus {
          border-color: rgba(56, 189, 248, 0.6) !important;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
        }

        /* Glass Buttons */
        .btn-row {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        button {
          padding: 9px 18px;
          border-radius: 12px;
          font-size: 13px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: 500;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        button:active {
          transform: scale(0.95);
        }
        .btn-c:hover {
          background: rgba(255, 255, 255, 0.18);
        }
        .btn-s {
          background: rgba(2, 132, 199, 0.45) !important;
          border-color: rgba(56, 189, 248, 0.5) !important;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
        }
        .btn-s:hover {
          background: rgba(2, 132, 199, 0.65) !important;
        }
      </style>

      <div class="fab" id="fab">
        <svg viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
      </div>

      <div class="backdrop" id="backdrop">
        <div class="modal" id="modalBox">
          <div class="cr">© 2026 @nice_osei • AdBlocker</div>
          <div class="header-row">
            <div class="title">
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Protection
            </div>
            <label class="switch">
              <input type="checkbox" id="blockerToggle">
              <span class="slider"></span>
            </label>
          </div>
          <p class="desc">Enter keywords separated by comma (,):</p>
          <textarea id="inp" placeholder="sponsored, ads, promoted..."></textarea>
          <div class="btn-row">
            <button class="btn-c" id="closeBtn">Close</button>
            <button class="btn-s" id="saveBtn">Save</button>
          </div>
        </div>
      </div>
    `;

    document.documentElement.appendChild(host);

    const fab = shadow.getElementById('fab');
    const backdrop = shadow.getElementById('backdrop');
    const modalBox = shadow.getElementById('modalBox');
    const inp = shadow.getElementById('inp');
    const closeBtn = shadow.getElementById('closeBtn');
    const saveBtn = shadow.getElementById('saveBtn');
    const blockerToggle = shadow.getElementById('blockerToggle');

    blockerToggle.checked = isBlockerActive;

    blockerToggle.onchange = () => {
      isBlockerActive = blockerToggle.checked;
      localStorage.setItem(STATE_KEY, isBlockerActive);
      if (isBlockerActive && document.body) {
        scan(document.body);
      }
    };

    function openModal() {
      inp.value = WORDS.join(', ');
      blockerToggle.checked = isBlockerActive;
      backdrop.classList.add('open');
    }
    function closeModal() {
      backdrop.classList.remove('open');
    }

    closeBtn.onclick = closeModal;
    backdrop.onclick = (e) => { if (e.target === backdrop) closeModal(); };
    modalBox.onclick = (e) => e.stopPropagation();

    saveBtn.onclick = () => {
      const parsed = inp.value.split(',').map(s => s.trim()).filter(Boolean);
      const toSave = parsed.length > 0 ? parsed : DEFAULT_WORDS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      updateWords(toSave);
      closeModal();
      if (isBlockerActive && document.body) scan(document.body);
    };

    // Drag Logic (Safe with Click Protection)
    let isDrag = false, sx = 0, sy = 0, il = 0, it = 0, moved = false;

    fab.onpointerdown = (e) => {
      isDrag = true;
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
      const rect = fab.getBoundingClientRect();
      il = rect.left;
      it = rect.top;

      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.left = il + 'px';
      fab.style.top = it + 'px';

      const move = (ev) => {
        if (!isDrag) return;
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        fab.style.left = Math.max(10, Math.min(il + dx, window.innerWidth - 65)) + 'px';
        fab.style.top = Math.max(10, Math.min(it + dy, window.innerHeight - 65)) + 'px';
      };

      const up = () => {
        isDrag = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        if (!moved) openModal();
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    };
  }

  // কন্ট্রোলার অবজেক্ট
  global.adsblocker = {
    init: function () {
      if (isRunning) return;
      isRunning = true;

      updateWords(getSavedWords());

      const start = () => {
        initUI();
        if (isBlockerActive && document.body) scan(document.body);

        setInterval(() => {
          if (!isRunning) return;
          if (!document.getElementById('__ad_remover_ui_host__')) initUI();
          if (isBlockerActive && document.body) scan(document.body);
        }, 400);

        let t;
        const obs = new MutationObserver((m) => {
          if (!isRunning || !isBlockerActive) return;
          clearTimeout(t);
          t = setTimeout(() => {
            for (const item of m) {
              for (const node of item.addedNodes) {
                if (node.nodeType === 1) scan(node);
              }
            }
          }, 30);
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
      } else {
        start();
      }
    }
  };

})(typeof window !== 'undefined' ? window : this);
