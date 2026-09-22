import { LATEST_VERSION, DOCS_VERSIONS } from '~/composables/useDocsVersion';

const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/;
export const STORAGE_KEY = 'doofpi-docs-version';

function getSavedVersion(): string {
  if (import.meta.server) return LATEST_VERSION;
  // sessionStorage clears on browser close → first visit always gets latest
  const saved = sessionStorage.getItem(STORAGE_KEY);
  return saved && (DOCS_VERSIONS as readonly string[]).includes(saved) ? saved : LATEST_VERSION;
}

export default defineNuxtRouteMiddleware(to => {
  if (!to.path.startsWith('/docs')) return;

  const segments = to.path.split('/').filter(Boolean);
  // segments[0] = 'docs'

  if (segments.length <= 1) {
    return navigateTo(`/docs/${getSavedVersion()}/introduction`, { replace: true });
  }

  if (!VERSION_PATTERN.test(segments[1] ?? '')) {
    const rest = segments.slice(1).join('/');
    return navigateTo(`/docs/${getSavedVersion()}/${rest}`, { replace: true });
  }
});
