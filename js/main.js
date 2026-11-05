/**
 * GrassGreen (G&G) — Official Website Script
 * High-performance, zero-bloat vanilla JavaScript
 * Fully compatible with GitHub Pages, mobile, tablet & desktop
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Toast Notification System ---
  const toast = document.getElementById('toastNotice');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    const msgElem = toast.querySelector('.toast-msg');
    if (msgElem) msgElem.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // --- Real-time GitHub Stars Fetcher ---
  async function fetchGitHubStars() {
    const starsElem = document.getElementById('githubStarsCount');
    if (!starsElem) return;

    // Cache in sessionStorage for 60 seconds to avoid hitting GitHub API rate limits on reloads
    const cachedStars = sessionStorage.getItem('gg_stars_count');
    const cachedTimestamp = sessionStorage.getItem('gg_stars_ts');
    const now = Date.now();

    if (cachedStars && cachedTimestamp && (now - Number(cachedTimestamp) < 60000)) {
      starsElem.textContent = cachedStars;
      return;
    }

    try {
      const response = await fetch('https://api.github.com/repos/m1oky/GrassGreen', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (typeof data.stargazers_count === 'number') {
          starsElem.textContent = data.stargazers_count;
          sessionStorage.setItem('gg_stars_count', data.stargazers_count.toString());
          sessionStorage.setItem('gg_stars_ts', now.toString());
        }
      }
    } catch (err) {
      // Retain default count on network failure or offline preview
    }
  }
  fetchGitHubStars();

  // --- Language Switcher (RU / EN) ---
  const langButtons = document.querySelectorAll('.lang-btn');
  const storedLang = localStorage.getItem('gg_lang') || 'ru';

  function setLanguage(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('gg_lang', lang);
    langButtons.forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.lang;
      setLanguage(selected);
      showToast(selected === 'ru' ? 'Язык: Русский' : 'Language: English');
    });
  });
  setLanguage(storedLang);

  // --- Mobile Hamburger Menu ---
  const hamburger = document.getElementById('headerHamburger');
  const navMenu = document.getElementById('headerNav');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-active');
      const expanded = navMenu.classList.contains('mobile-active');
      hamburger.setAttribute('aria-expanded', expanded);
    });

    // Close when clicking nav link on mobile
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-active');
      });
    });
  }

  // --- Code Showcase Tabs ---
  const tabBtns = document.querySelectorAll('.code-tab-btn');
  const codePanels = document.querySelectorAll('.code-snippet-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      codePanels.forEach(panel => {
        if (panel.id === `snippet-${targetTab}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // --- Copy Code Window Content (respecting active language) ---
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      const activePanel = document.querySelector('.code-snippet-panel.active');
      if (activePanel) {
        const currentLang = document.documentElement.getAttribute('data-lang') || 'ru';
        const targetPre = activePanel.querySelector(`pre[data-i18n-${currentLang}]`) || activePanel.querySelector('pre');
        if (targetPre) {
          const text = targetPre.textContent;
          navigator.clipboard.writeText(text).then(() => {
            showToast(currentLang === 'ru' ? 'Код скопирован в буфер обмена' : 'Code copied to clipboard');
          }).catch(() => {
            showToast('Не удалось скопировать / Copy failed');
          });
        }
      }
    });
  }

  // --- Terminal Command Mode Switcher ---
  const termModeBtns = document.querySelectorAll('.term-mode-btn');
  const termCmdText = document.getElementById('terminalCmdText');

  termModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      termModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cmd = btn.dataset.cmd;
      if (termCmdText && cmd) {
        termCmdText.textContent = cmd;
      }
    });
  });

  // --- Copy Terminal Command ---
  const copyTermBtn = document.getElementById('copyTermBtn');
  if (copyTermBtn) {
    copyTermBtn.addEventListener('click', () => {
      const cmdText = document.getElementById('terminalCmdText');
      if (cmdText) {
        const text = cmdText.textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
          const currentLang = document.documentElement.getAttribute('data-lang') || 'ru';
          showToast(currentLang === 'ru' ? 'Команда скопирована!' : 'Command copied!');
        }).catch(() => {
          showToast('Не удалось скопировать');
        });
      }
    });
  }

  // --- Standard Library Expand / Accordion ---
  const libCards = document.querySelectorAll('.lib-card');
  libCards.forEach(card => {
    const header = card.querySelector('.lib-card-header');
    if (header) {
      header.addEventListener('click', () => {
        const isCurrentlyExpanded = card.classList.contains('expanded');
        // Accordion behavior: close other cards cleanly
        libCards.forEach(c => {
          if (c !== card) c.classList.remove('expanded');
        });
        if (isCurrentlyExpanded) {
          card.classList.remove('expanded');
        } else {
          card.classList.add('expanded');
        }
      });
    }
  });

  // --- Standard Library Live Search (without unwanted auto-expansion) ---
  const libSearchInput = document.getElementById('libSearchInput');
  const libCountElem = document.getElementById('libVisibleCount');

  if (libSearchInput && libCards.length > 0) {
    libSearchInput.addEventListener('input', () => {
      const query = libSearchInput.value.toLowerCase().trim();
      let visible = 0;

      libCards.forEach(card => {
        const name = card.dataset.name ? card.dataset.name.toLowerCase() : '';
        const keywords = card.dataset.keywords ? card.dataset.keywords.toLowerCase() : '';
        const text = card.textContent.toLowerCase();

        if (!query || name.includes(query) || keywords.includes(query) || text.includes(query)) {
          card.style.display = 'block';
          visible++;
        } else {
          card.style.display = 'none';
        }

        // When search is cleared, ensure cards are returned to neat collapsed state
        if (!query) {
          card.classList.remove('expanded');
        }
      });

      document.querySelectorAll('.lib-visible-count').forEach(el => {
        el.textContent = visible;
      });
    });
  }

  // --- Roadmap Category Filtering ---
  const roadmapBtns = document.querySelectorAll('.roadmap-filter-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');

  roadmapBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      roadmapBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      timelineItems.forEach(item => {
        const itemCat = item.dataset.category || '';
        if (category === 'all' || itemCat === category || itemCat.split(' ').includes(category)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // --- Header Blur and Elevation on Scroll ---
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }
});
