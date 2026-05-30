export const ROUTES = {
  INTRO:       'intro',
  QUIZ:        'quiz',
  HOME:        'home',
  DEVOTIONAL:  'devotional',
  TOC:         'contents',
  SEARCH:      'search',
  FAVORITES:   'favorites',
  PROGRESS:    'progress',
  REFLECTIONS: 'reflections',
  PRIVACY:     'privacy',
  SETTINGS:    'settings',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];

/** Routes visible in the main navigation */
export const NAV_ROUTES: Route[] = [
  ROUTES.HOME,
  ROUTES.DEVOTIONAL,
  ROUTES.TOC,
  ROUTES.PROGRESS,
  ROUTES.SETTINGS,
];

export const DEFAULT_ROUTE: Route = ROUTES.HOME;
export const FIRST_TIME_ROUTE: Route = ROUTES.INTRO;
