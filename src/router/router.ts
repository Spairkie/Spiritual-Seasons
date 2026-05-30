import type { Route } from './routes';

export interface RouteParams {
  day?: number;
  page?: string;
  [key: string]: string | number | undefined;
}

type RouteHandler = (params: RouteParams) => Promise<void>;

class HashRouter {
  private routes = new Map<string, RouteHandler>();
  private currentRoute: Route | null = null;
  private onNavigate: ((route: Route) => void) | null = null;

  register(route: Route, handler: RouteHandler): void {
    this.routes.set(route, handler);
  }

  setNavigationCallback(fn: (route: Route) => void): void {
    this.onNavigate = fn;
  }

  async navigate(route: Route, params: RouteParams = {}): Promise<void> {
    const parts: string[] = [route];

    if (params.day !== undefined) {
      parts.push(String(params.day));
    }

    const query = Object.entries(params)
      .filter(([k]) => k !== 'day')
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');

    const hash = query ? `${parts.join('/')}?${query}` : parts.join('/');
    window.location.hash = hash;
  }

  private parseHash(hash: string): { route: string; params: RouteParams } {
    const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const [pathPart, queryPart] = withoutHash.split('?');
    const pathSegments = pathPart.split('/').filter(Boolean);
    const route = pathSegments[0] ?? '';

    const params: RouteParams = {};

    if (pathSegments[1]) {
      const day = parseInt(pathSegments[1], 10);
      if (!isNaN(day)) params.day = day;
    }

    if (queryPart) {
      for (const pair of queryPart.split('&')) {
        const [k, v] = pair.split('=');
        if (k && v) params[k] = decodeURIComponent(v);
      }
    }

    return { route, params };
  }

  private async dispatch(hash: string): Promise<void> {
    const { route, params } = this.parseHash(hash);
    const handler = this.routes.get(route);

    if (handler) {
      this.currentRoute = route as Route;
      this.onNavigate?.(route as Route);
      await handler(params);
      // Scroll content area back to top on navigation
      document.getElementById('main-content')?.scrollTo(0, 0);
    }
  }

  init(): void {
    window.addEventListener('hashchange', () => {
      void this.dispatch(window.location.hash);
    });

    // Navigate to current hash or trigger default via caller
    void this.dispatch(window.location.hash);
  }

  getCurrentRoute(): Route | null {
    return this.currentRoute;
  }
}

// Singleton instance — import this everywhere
export const router = new HashRouter();
