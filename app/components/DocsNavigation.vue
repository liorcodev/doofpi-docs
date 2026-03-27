<script setup lang="ts">
const route = useRoute();
const { currentVersion } = useDocsVersion();

const pageSlugs = [
  { title: 'Introduction', slug: 'introduction' },
  { title: 'Quick Start', slug: 'quick-start' },
  { title: 'Routing', slug: 'core-concepts/routing' },
  { title: 'Read & Write', slug: 'core-concepts/read-and-write' },
  { title: 'Zod Validation', slug: 'core-concepts/zod-validation' },
  { title: 'Client', slug: 'core-concepts/client' },
  { title: 'Context & Middleware', slug: 'guides/context-and-middleware' },
  { title: 'Authentication & Authorization', slug: 'guides/authentication' },
  { title: 'Error Handling', slug: 'guides/error-handling' },
  { title: 'Runtime Environments', slug: 'guides/runtime-environments' },
  { title: 'Doofpi Class', slug: 'api-reference/doofpi-class' },
  { title: 'createClient', slug: 'api-reference/create-client' },
  { title: 'EndpointBuilder', slug: 'api-reference/endpoint-builder' },
  { title: 'Errors', slug: 'api-reference/errors' },
  { title: 'Comparison', slug: 'comparison' }
];

const allPages = computed(() =>
  pageSlugs.map(p => ({ title: p.title, to: `/docs/${currentVersion.value}/${p.slug}` }))
);

const currentIndex = computed(() => allPages.value.findIndex(p => p.to === route.path));
const prev = computed(() =>
  currentIndex.value > 0 ? allPages.value[currentIndex.value - 1] : null
);
const next = computed(() =>
  currentIndex.value < allPages.value.length - 1 ? allPages.value[currentIndex.value + 1] : null
);
</script>

<template>
  <div v-if="prev || next" class="flex gap-4 pt-8 border-t border-orange-100">
    <NuxtLink
      v-if="prev"
      :to="prev.to"
      class="flex-1 flex flex-col gap-1 px-5 py-4 rounded-xl border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50 transition-all duration-200 group"
    >
      <span class="text-xs text-slate-500 flex items-center gap-1.5">
        <Icon name="heroicons:arrow-left" class="text-sm" /> Previous
      </span>
      <span
        class="text-sm font-medium text-slate-300 group-hover:text-orange-300 transition-colors"
      >
        {{ prev.title }}
      </span>
    </NuxtLink>
    <NuxtLink
      v-if="next"
      :to="next.to"
      class="flex-1 flex flex-col gap-1 px-5 py-4 rounded-xl border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50 transition-all duration-200 group text-right ml-auto"
    >
      <span class="text-xs text-slate-500 flex items-center gap-1.5 justify-end">
        Next <Icon name="heroicons:arrow-right" class="text-sm" />
      </span>
      <span
        class="text-sm font-medium text-slate-700 group-hover:text-orange-700 transition-colors"
      >
        {{ next.title }}
      </span>
    </NuxtLink>
  </div>
</template>
