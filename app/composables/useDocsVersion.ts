// List versions newest-first; the first entry is treated as "latest".
export const DOCS_VERSIONS = ['v1.0.0'] as const;
export type DocsVersion = (typeof DOCS_VERSIONS)[number];
export const LATEST_VERSION: DocsVersion = DOCS_VERSIONS[0]!;

/**
 * Returns the versions that should be checked as fallbacks for `version`,
 * ordered from the requested version down to the oldest.
 * e.g. if versions = ['v1.2.0','v1.1.0','v1.0.0'] and version = 'v1.1.0'
 * → ['v1.1.0', 'v1.0.0']
 */
export function getFallbackChain(version: string): string[] {
  const idx = (DOCS_VERSIONS as readonly string[]).indexOf(version);
  if (idx === -1) return [...DOCS_VERSIONS];
  return (DOCS_VERSIONS as readonly string[]).slice(idx);
}

export function useDocsVersion() {
  const route = useRoute();

  const currentVersion = computed<DocsVersion>(() => {
    const segments = route.path.split('/').filter(Boolean);
    const v = segments[1];
    return (DOCS_VERSIONS as readonly string[]).includes(v ?? '')
      ? (v as DocsVersion)
      : LATEST_VERSION;
  });

  function versionedPath(slug: string, version?: string): string {
    const v = version ?? currentVersion.value;
    return `/docs/${v}/${slug}`;
  }

  return {
    currentVersion,
    versions: DOCS_VERSIONS,
    latestVersion: LATEST_VERSION,
    versionedPath
  };
}
