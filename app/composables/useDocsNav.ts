export interface DocsNavItem {
  title: string;
  slug: string;
}

export interface DocsNavGroup {
  group: string;
  items: DocsNavItem[];
}

export function getDocsNav(version: string): DocsNavGroup[] {
  return [
    {
      group: 'Getting Started',
      items: [
        { title: 'Introduction', slug: 'introduction' },
        { title: 'Quick Start', slug: 'quick-start' }
      ]
    },
    {
      group: 'Core Concepts',
      items: [
        { title: 'Routing', slug: 'core-concepts/routing' },
        {
          title: version === 'v1.0.0' ? 'Read & Write' : 'Read, Write, Download & Upload',
          slug: 'core-concepts/read-and-write'
        },
        { title: 'Zod Validation', slug: 'core-concepts/zod-validation' },
        { title: 'Client', slug: 'core-concepts/client' }
      ]
    },
    {
      group: 'Guides',
      items: [
        { title: 'Context & Middleware', slug: 'guides/context-and-middleware' },
        { title: 'Authentication & Authorization', slug: 'guides/authentication' },
        { title: 'Error Handling', slug: 'guides/error-handling' },
        { title: 'Runtime Environments', slug: 'guides/runtime-environments' }
      ]
    },
    {
      group: 'API Reference',
      items: [
        { title: 'Doofpi Class', slug: 'api-reference/doofpi-class' },
        { title: 'createClient', slug: 'api-reference/create-client' },
        { title: 'EndpointBuilder', slug: 'api-reference/endpoint-builder' },
        { title: 'Errors', slug: 'api-reference/errors' }
      ]
    },
    {
      group: 'More',
      items: [{ title: 'Comparison', slug: 'comparison' }]
    }
  ];
}
