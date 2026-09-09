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

  // ডিফল্ট কিওয়ার্ড তালিকা
  const DEFAULT_WORDS = ["sроnsоrеd", "Sроnsоrеd", "SРОNSОRЕD"];
  const STORAGE_KEY = '__AD_REMOVER_WORDS__';

  // লোকাল স্টোরেজ থেকে শব্দ লোড করা
  function getSavedWords() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_WORDS;
  }

  let currentWords = getSavedWords();
  let NORMALIZED_WORDS = [];

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

  function updateNormalizedWords() {
    NORMALIZED_WORDS = currentWords
      .map(normalize)
      .filter(Boolean);
  }
  updateNormalizedWords();

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

    // আমাদের কাস্টম UI উপাদান ফিল্টার থেকে বাদ দেওয়া
    if (root.id === '__ad_remover_ui_root__' || root.closest && root.closest('#__ad_remover_ui_root__')) {
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

      if (el.closest && el.closest('#__ad_remover_ui_root__')) continue;
      if (el.dataset.__adRemoved === '1') continue;

      const text = el.innerText || el.textContent || '';
      if (!text.trim()) continue;

      const count = matches(text);
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

  // --- UI তৈরি (Floating Button + Dialog) ---
  function createUI() {
    if (document.getElementById('__ad_remover_ui_root__')) return;

    const root = document.createElement('div');
    root.id = '__ad_remover_ui_root__';

    // UI স্টাইল
    const style = document.createElement('style');
    style.textContent = `
      #__ad_remover_fab__ {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 50px;
        height: 50px;
        background: #111827;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 2147483647;
        user-select: none;
        transition: transform 0.2s ease;
      }
      #__ad_remover_fab__:hover {
        transform: scale(1.08);
      }
      #__ad_remover_modal__ {
        display: none;
        position: fixed;
        bottom: 85px;
        right: 24px;
        width: 320px;
        background: #ffffff;
        color: #1f2937;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        border: 1px solid #e5e7eb;
        padding: 16px;
        z-index: 2147483647;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #__ad_remover_modal__ h3 {
        margin: 0 0 8px 0;
        font-size: 15px;
        font-weight: 600;
        color: #111827;
      }
      #__ad_remover_modal__ p {
        margin: 0 0 10px 0;
        font-size: 12px;
        color: #6b7280;
      }
      #__ad_remover_modal__ textarea {
        width: 100%;
        box-sizing: border-box;
        height: 75px;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 13px;
        resize: vertical;
        outline: none;
      }
      #__ad_remover_modal__ textarea:focus {
        border-color: #2563eb;
      }
      #__ad_remover_btn_group__ {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
      }
      #__ad_remover_modal__ button {
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
      }
      #__ad_remover_save__ {
        background: #2563eb;
        color: #fff;
      }
      #__ad_remover_save__:hover {
        background: #1d4ed8;
      }
      #__ad_remover_close__ {
        background: #f3f4f6;
        color: #4b5563;
      }
      #__ad_remover_close__:hover {
        background: #e5e7eb;
      }
    `;

    // FAB Button
    const fab = document.createElement('div');
    fab.id = '__ad_remover_fab__';
    fab.title = 'Ad Blocker Keywords';
    fab.innerHTML = '🛡️';

    // Modal
    const modal = document.createElement('div');
    modal.id = '__ad_remover_modal__';
    modal.innerHTML = `
      <h3>Blocked Keywords</h3>
      <p>শব্দগুলো কমা (,) দিয়ে লিখুন:</p>
      <textarea id="__ad_remover_input__" placeholder="halo, hi, sponsored..."></textarea>
      <div id="__ad_remover_btn_group__">
        <button id="__ad_remover_close__">Cancel</button>
        <button id="__ad_remover_save__">Save</button>
      </div>
    `;

    root.appendChild(style);
    root.appendChild(fab);
    root.appendChild(modal);
    document.body.appendChild(root);

    const input = modal.querySelector('#__ad_remover_input__');
    const saveBtn = modal.querySelector('#__ad_remover_save__');
    const closeBtn = modal.querySelector('#__ad_remover_close__');

    // টগল ফাংশন
    fab.addEventListener('click', function() {
      const isVisible = modal.style.display === 'block';
      if (!isVisible) {
        input.value = currentWords.join(', ');
        modal.style.display = 'block';
      } else {
        modal.style.display = 'none';
      }
    });

    closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });

    // Save বাটনে ক্লিক করলে অ্যারে আকারে রূপান্তর এবং সেভ
    saveBtn.addEventListener('click', function() {
      const text = input.value;
      const parsedArray = text
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0);

      currentWords = parsedArray.length > 0 ? parsedArray : DEFAULT_WORDS;

      // localStorage-এ JSON অ্যারে হিসেবে সংরক্ষণ
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentWords));

      updateNormalizedWords();
      modal.style.display = 'none';
      scan(document.body);
    });
  }

  function start() {
    createUI();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }

})();
