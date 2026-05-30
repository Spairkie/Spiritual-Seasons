import './styles/main.css';

import { router } from './router/router';
import { ROUTES, DEFAULT_ROUTE, FIRST_TIME_ROUTE, NAV_ROUTES } from './router/routes';
import type { Route } from './router/routes';

import { renderHome }        from './pages/home';
import { renderDevotional }  from './pages/devotional';
import { renderQuiz }        from './pages/quiz';
import { renderIntro }       from './pages/intro';
import { renderTOC }         from './pages/toc';
import { renderSearch }      from './pages/search';
import { renderFavorites }   from './pages/favorites';
import { renderProgress }    from './pages/progress';
import { renderReflections } from './pages/reflections';
import { renderSettings }    from './pages/settings';
import { renderPrivacy }     from './pages/privacy';

import { getSettings } from './store/settings';
import { getQuizResults, getCurrentDay } from './store/user';
import { themeManager } from './ui/theme-manager';

async function init(): Promise<void> {
  // Apply stored theme before the shell appears to avoid flash
  await applyStoredTheme();

  showShell();
  registerRoutes();
  setupNavigation();

  // Route first-time users to intro; returning users to home
  if (!window.location.hash || window.location.hash === '#') {
    const quizResults = await getQuizResults();
    const startRoute = quizResults ? DEFAULT_ROUTE : FIRST_TIME_ROUTE;
    await router.navigate(startRoute);
  } else {
    router.init();
  }

  hideSplash();
  registerServiceWorker();
}

async function applyStoredTheme(): Promise<void> {
  const [settings, currentDay] = await Promise.all([getSettings(), getCurrentDay()]);
  themeManager.init(settings.darkMode, settings.seasonTheme, currentDay);
  themeManager.applyFontSize(settings.fontSize);
  themeManager.applyLineSpacing(settings.lineSpacing);
}

function showShell(): void {
  const shell = document.getElementById('shell');
  if (shell) shell.hidden = false;
}

function hideSplash(): void {
  const splash = document.getElementById('splash');
  if (splash) {
    // Small delay so users see the splash briefly on first load
    setTimeout(() => {
      splash.classList.add('is-hidden');
      setTimeout(() => splash.remove(), 500);
    }, 600);
  }
}

function registerRoutes(): void {
  router.register(ROUTES.INTRO,       renderIntro);
  router.register(ROUTES.QUIZ,        renderQuiz);
  router.register(ROUTES.HOME,        renderHome);
  router.register(ROUTES.DEVOTIONAL,  renderDevotional);
  router.register(ROUTES.TOC,         renderTOC);
  router.register(ROUTES.SEARCH,      renderSearch);
  router.register(ROUTES.FAVORITES,   renderFavorites);
  router.register(ROUTES.PROGRESS,    renderProgress);
  router.register(ROUTES.REFLECTIONS, renderReflections);
  router.register(ROUTES.PRIVACY,     renderPrivacy);
  router.register(ROUTES.SETTINGS,    renderSettings);

  router.setNavigationCallback(updateActiveNav);
  router.init();
}

function setupNavigation(): void {
  // Delegate nav clicks — works for both bottom-nav and sidebar-nav
  document.addEventListener('click', (e) => {
    const target = (e.target as Element).closest('[data-route]') as HTMLElement | null;
    if (!target) return;

    const route = target.dataset['route'] as Route | undefined;
    if (route && NAV_ROUTES.includes(route)) {
      e.preventDefault();
      void router.navigate(route);
    }
  });
}

function updateActiveNav(route: Route): void {
  // Update aria-current and active class on all nav items
  document.querySelectorAll('[data-route]').forEach((el) => {
    const itemRoute = (el as HTMLElement).dataset['route'];
    const isActive = itemRoute === route;

    el.classList.toggle('is-active', isActive);
    if (isActive) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });

  // Update header title
  const titleEl = document.getElementById('header-title');
  if (titleEl) {
    titleEl.textContent = getPageTitle(route);
  }
}

function getPageTitle(route: Route): string {
  const titles: Record<Route, string> = {
    intro:       'Introduction',
    quiz:        'Discover Your Season',
    home:        'Spiritual Seasons',
    devotional:  'Today\'s Reading',
    contents:    'All 120 Days',
    search:      'Search',
    favorites:   'Favourites',
    progress:    'Progress',
    reflections: 'Weekly Reflections',
    privacy:     'Privacy & Data',
    settings:    'Settings',
  };
  return titles[route] ?? 'Spiritual Seasons';
}

function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    // vite-plugin-pwa injects the SW registration; this is a fallback
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .catch(() => {
          // SW not available in dev mode — this is expected
        });
    });
  }
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void init());
} else {
  void init();
}

// Expose default route for reference
export { DEFAULT_ROUTE };
