<script setup lang="ts">
const route = useRoute();

interface Heading {
  id: string;
  text: string;
  level: number;
}

const headings = ref<Heading[]>([]);
const activeId = ref('');

function scan() {
  const nodes = document.querySelectorAll<HTMLElement>('article h2[id], article h3[id]');
  headings.value = Array.from(nodes).map(el => ({
    id: el.id,
    text: el.textContent?.trim() ?? '',
    level: Number(el.tagName[1])
  }));
}

function onScroll() {
  const nodes = document.querySelectorAll<HTMLElement>('article h2[id], article h3[id]');
  let cur = '';
  for (const el of Array.from(nodes)) {
    if (el.getBoundingClientRect().top <= 104) cur = el.id;
    else break;
  }
  if (cur) activeId.value = cur;
}

onMounted(() => {
  // Try immediately first (cache hit / fast render)
  scan();
  onScroll();

  // If headings aren't in DOM yet, watch for them via MutationObserver
  if (!headings.value.length) {
    const observer = new MutationObserver(() => {
      scan();
      if (headings.value.length) {
        observer.disconnect();
        onScroll();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));

watch(
  () => route.path,
  () => {
    const observer = new MutationObserver(() => {
      scan();
      if (headings.value.length) {
        observer.disconnect();
        onScroll();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
);
</script>

<template>
  <aside
    v-if="headings.length"
    class="fixed top-16 right-0 bottom-0 w-56 overflow-y-auto border-l border-slate-200 bg-white px-4 py-8 hidden lg:block z-30"
  >
    <p class="mb-3 px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      On this page
    </p>
    <ul class="space-y-0.5">
      <li v-for="h in headings" :key="h.id">
        <a
          :href="`#${h.id}`"
          :class="[
            'block rounded px-2 py-1 text-sm transition-colors',
            h.level === 3 ? 'pl-5' : '',
            activeId === h.id
              ? 'text-orange-600 font-medium'
              : 'text-slate-500 hover:text-slate-900'
          ]"
          >{{ h.text }}</a
        >
      </li>
    </ul>
  </aside>
</template>
