<script setup lang="ts">
definePageMeta({ layout: 'docs', middleware: ['docs-version'] });

const route = useRoute();

// Build the fallback chain: try requested version first, then older versions.
// This means you only need to add files that *changed* in a new version.
const segments = route.path.split('/').filter(Boolean);
const requestedVersion = segments[1] ?? '';
const pageSlug = segments.slice(2).join('/');
const fallbackChain = getFallbackChain(requestedVersion);

const { data: page } = await useAsyncData('docs-' + route.path, async () => {
  for (const v of fallbackChain) {
    const result = await queryCollection('docs').path(`/docs/${v}/${pageSlug}`).first();
    if (result) return result;
  }
  return null;
});

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

useHead({
  title: page.value?.title ? `${page.value.title} - doofpi docs` : 'doofpi docs'
});
</script>

<template>
  <article class="prose">
    <ContentRenderer v-if="page" :value="page" />
  </article>
</template>
