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
  const WORDS = ["sроnsоrеd", "Sроnsоrеd", "SРОNSОRЕD"];

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

  const NORMALIZED_WORDS = WORDS
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

  function start() {
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
