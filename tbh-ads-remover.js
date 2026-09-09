/*!
 * AdBlocker v1.0.1
 * © 2026 @nice_osei
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const instance = factory();
    root.adsblocker = instance;
    root.adBlocker = instance;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const STORAGE_KEY = '__AD_REMOVER_WORDS__';
  const DEFAULT_WORDS = ["sроnsоrеd", "Sроnsоrеd", "SРОNSОRЕD", "sponsored", "promoted"];

  let isInitialized = false;
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
      if (container && container !== document.body) {
        hideElement(container);
      } else {
        hideElement(el);
      }
    }
  }

  // --- UI CREATION (DIRECT BODY MOUNT) ---
  function initUI() {
    if (document.getElementById('__ad_remover_ui_host__')) return;

    const host = document.createElement('div');
    host.id = '__ad_remover_ui_host__';

    const shadow = host.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          position: static;
        }
        * {
          box-sizing: border-box;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .fab {
          position: fixed !important;
          bottom: 30px !important;
          right: 25px !important;
          width: 55px !important;
          height: 55px !important;
          border-radius: 50% !important;
          background: #1e293b !important;
          background: rgba(30, 41, 59, 0.88) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.35) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          z-index: 2147483647 !important;
          touch-action: none !important;
          user-select: none !important;
        }
        .fab svg {
          width: 28px;
          height: 28px;
          fill: none;
          stroke: #60a5fa;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          pointer-events: none;
        }
        .backdrop {
          display: none;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.65) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          z-index: 2147483647 !important;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .backdrop.open {
          display: flex !important;
        }
        .modal {
          width: 100%;
          max-width: 350px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes pop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .cr {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .title {
          margin: 0 0 6px 0;
          font-size: 17px;
          font-weight: 600;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .title svg {
          width: 18px;
          height: 18px;
          stroke: #38bdf8;
          stroke-width: 2;
        }
        .desc {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #94a3b8;
        }
        textarea {
          width: 100%;
          height: 85px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 10px;
          color: #fff;
          font-size: 13px;
          resize: none;
          outline: none;
        }
        textarea:focus {
          border-color: #3b82f6;
        }
        .btn-row {
          margin-top: 15px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        button {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          border: none;
          font-weight: 500;
        }
        .btn-c { background: rgba(255, 255, 255, 0.1); color: #cbd5e1; }
        .btn-s { background: #2563eb; color: #fff; }
      </style>

      <div class="fab" id="fab">
        <svg viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
      </div>

      <div class="backdrop" id="backdrop">
        <div class="modal">
          <div class="cr">© 2026 @nice_osei</div>
          <div class="title">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Filter Keywords
          </div>
          <p class="desc">Enter keywords separated by comma (,):</p>
          <textarea id="inp" placeholder="sponsored, ads..."></textarea>
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
    const inp = shadow.getElementById('inp');
    const closeBtn = shadow.getElementById('closeBtn');
    const saveBtn = shadow.getElementById('saveBtn');

    function openModal() {
      inp.value = WORDS.join(', ');
      backdrop.classList.add('open');
    }
    function closeModal() {
      backdrop.classList.remove('open');
    }

    closeBtn.onclick = closeModal;
    backdrop.onclick = (e) => { if (e.target === backdrop) closeModal(); };

    saveBtn.onclick = () => {
      const parsed = inp.value.split(',').map(s => s.trim()).filter(Boolean);
      const toSave = parsed.length > 0 ? parsed : DEFAULT_WORDS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      updateWords(toSave);
      closeModal();
      if (document.body) scan(document.body);
    };

    // Simple Drag & Click
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

  // --- CONTROLLER ---
  return {
    init: function () {
      if (isInitialized) return;
      isInitialized = true;
      console.log('[AdBlocker] Initialized manually.');

      updateWords(getSavedWords());

      const start = () => {
        initUI();
        if (document.body) scan(document.body);

        setInterval(() => {
          if (!document.getElementById('__ad_remover_ui_host__')) initUI();
          if (document.body) scan(document.body);
        }, 400);

        let t;
        const obs = new MutationObserver((m) => {
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
});
