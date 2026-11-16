<script setup lang="ts">
import Fuse from 'fuse.js';
import { getFallbackChain } from '~/composables/useDocsVersion';

const route = useRoute();
const { currentVersion } = useDocsVersion();
const isScrolled = ref(false);
const { isOpen: mobileOpen, toggle: toggleMobileMenu } = useMobileMenu();

const homeMenuOpen = ref(false);
const isDocsPage = computed(() => route.path.startsWith('/docs'));
const handleMobileMenuClick = () => {
  if (isDocsPage.value) toggleMobileMenu();
  else homeMenuOpen.value = !homeMenuOpen.value;
};

watch(
  () => route.path,
  () => {
    homeMenuOpen.value = false;
  }
);

const links = [
  { label: 'Docs', to: '/docs/introduction' },
  { label: 'Quick Start', to: '/docs/quick-start' },
  { label: 'API', to: '/docs/api-reference/doofpi-class' }
];

// ── Search ──────────────────────────────────────────────
const searchOpen = ref(false);
const searchQuery = ref('');
const debouncedQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
const searching = ref(false);
const selectedIndex = ref(0);
const resultsContainerRef = ref<HTMLElement | null>(null);

type SearchSection = {
  id: string;
  title: string;
  titles: string[];
  level: number;
  content: string;
};

type ScoredSearchResult = SearchSection & { score: number; snippet: string };

let allSections: SearchSection[] = [];
let fuse: Fuse<SearchSection> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function extractContext(
  text: string,
  indices: readonly [number, number][],
  maxLength = 150
): string {
  const first = indices[0];
  if (!text || !first) return (text ?? '').slice(0, maxLength);

  let start = 0;
  let end = text.length;
  if (text.length > maxLength) {
    start = Math.max(0, first[0] - 40);
    end = Math.min(text.length, first[0] + maxLength - 40);
    if (start > 0) {
      const spacePos = text.indexOf(' ', start);
      start = spacePos !== -1 ? spacePos + 1 : start;
    }
    if (end < text.length) {
      const spacePos = text.lastIndexOf(' ', end);
      end = spacePos !== -1 ? spacePos : end;
    }
  }

  let result = text.slice(start, end);
  if (start > 0) result = '...' + result;
  if (end < text.length) result += '...';
  return result;
}

const searchResults = computed<ScoredSearchResult[]>(() => {
  const q = debouncedQuery.value.trim();
  if (!q || !fuse) return [];

  return fuse.search(q, { limit: 12 }).map(({ item, score = 0, matches = [] }) => {
    const contentMatch = matches.find(m => m.key === 'content');
    return {
      ...item,
      score: (1 - score) * 10,
      snippet: contentMatch
        ? extractContext(item.content, contentMatch.indices)
        : item.content.slice(0, 150)
    };
  });
});

// "/docs/v1.0.0/core-concepts/routing#hash" -> { version: 'v1.0.0', slug: 'core-concepts/routing' }
function parseSectionId(id: string): { version: string; slug: string } {
  const path = id.split('#')[0] ?? id;
  const parts = path.split('/').filter(Boolean);
  return { version: parts[1] ?? '', slug: parts.slice(2).join('/') };
}

watch(currentVersion, () => {
  allSections = [];
  fuse = null;
});

async function loadSections() {
  if (allSections.length) return;
  searching.value = true;
  try {
    const raw = (await queryCollectionSearchSections('docs')) as SearchSection[];
    const chain = getFallbackChain(currentVersion.value);

    // For each page slug keep only the section from the highest-priority version
    const winnerMap = new Map<string, string>();
    for (const section of raw) {
      const { version, slug } = parseSectionId(section.id);
      if (!chain.includes(version)) continue;
      const existing = winnerMap.get(slug);
      if (!existing || chain.indexOf(version) < chain.indexOf(existing)) {
        winnerMap.set(slug, version);
      }
    }
    allSections = raw.filter(s => {
      const { version, slug } = parseSectionId(s.id);
      return winnerMap.get(slug) === version;
    });

    fuse = new Fuse(allSections, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'titles', weight: 1 },
        { name: 'content', weight: 0.5 }
      ],
      threshold: 0.2,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    });
  } finally {
    searching.value = false;
  }
}

watch(searchQuery, newQuery => {
  selectedIndex.value = 0;
  if (debounceTimer) clearTimeout(debounceTimer);

  if (!newQuery.trim() || newQuery.length <= 2) {
    debouncedQuery.value = newQuery;
    return;
  }
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newQuery;
  }, 150);
});

async function openSearch() {
  searchOpen.value = true;
  searchQuery.value = '';
  debouncedQuery.value = '';
  selectedIndex.value = 0;
  nextTick(() => searchInput.value?.focus());
  await loadSections();
}

function closeSearch() {
  searchOpen.value = false;
  searchQuery.value = '';
  debouncedQuery.value = '';
  selectedIndex.value = 0;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function scrollToSelectedResult() {
  nextTick(() => {
    resultsContainerRef.value
      ?.querySelector(`[data-result-index="${selectedIndex.value}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  });
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1);
    scrollToSelectedResult();
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
    scrollToSelectedResult();
  }
  if (e.key === 'Enter' && searchResults.value[selectedIndex.value]) {
    navigateTo(searchResults.value[selectedIndex.value]!.id);
    closeSearch();
  }
}

onMounted(() => {
  const onGlobalKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  };
  const onScroll = () => {
    isScrolled.value = window.scrollY > 8;
  };
  onScroll();
  window.addEventListener('keydown', onGlobalKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  onUnmounted(() => {
    window.removeEventListener('keydown', onGlobalKey);
    window.removeEventListener('scroll', onScroll);
    if (debounceTimer) clearTimeout(debounceTimer);
  });
});
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="
      isScrolled || isDocsPage
        ? 'bg-canvas/85 backdrop-blur-xl border-b border-line'
        : 'bg-transparent border-b border-transparent'
    "
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <img src="/logo.svg" class="w-8 h-8" alt="doofpi logo" />
        <span class="text-ink font-bold text-lg tracking-tight">
          doof<span class="text-accent">pi</span>
        </span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          :class="
            link.label === 'Docs' && isDocsPage
              ? 'text-accent bg-accent-soft'
              : 'text-body hover:text-ink hover:bg-subtle'
          "
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <button
          class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-ink border border-line-strong hover:border-brand-400 bg-surface hover:bg-accent-soft transition-all duration-200 w-44"
          @click="openSearch"
        >
          <Icon name="heroicons:magnifying-glass" class="text-sm shrink-0" />
          <span class="flex-1 text-left">Search docs...</span>
          <span class="text-[10px] border border-line-strong rounded px-1 py-0.5">Ctrl K</span>
        </button>
        <a
          href="https://www.npmjs.com/package/doofpi"
          target="_blank"
          rel="noopener"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-muted hover:text-ink border border-line-strong hover:border-brand-400 bg-surface hover:bg-accent-soft transition-all duration-200"
        >
          <Icon name="simple-icons:npm" class="text-red-500 text-base" />
          doofpi
        </a>
        <a
          href="https://github.com/liorcodev/doofpi"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
          class="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-ink border border-line-strong hover:border-brand-400 bg-surface hover:bg-accent-soft transition-all duration-200"
        >
          <Icon name="simple-icons:github" class="text-base" />
        </a>
        <button
          class="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-ink border border-line-strong bg-surface transition-colors"
          aria-label="Search"
          @click="openSearch"
        >
          <Icon name="heroicons:magnifying-glass" class="text-base" />
        </button>
        <button
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-body hover:text-ink bg-subtle hover:bg-line transition-colors"
          aria-label="Menu"
          @click="handleMobileMenuClick"
        >
          <Icon
            :name="
              (isDocsPage && mobileOpen) || homeMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'
            "
            class="text-lg"
          />
        </button>
      </div>
    </div>
  </header>

  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="homeMenuOpen && !isDocsPage"
      class="fixed top-16 left-0 right-0 z-40 md:hidden bg-canvas border-b border-line shadow-lg"
    >
      <nav class="flex flex-col py-2 px-4">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-4 py-3 text-sm font-medium text-body hover:bg-subtle hover:text-accent rounded-lg transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </Transition>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="searchOpen"
        class="fixed inset-0 z-100 flex items-start justify-center pt-[12vh] px-4"
        @mousedown.self="closeSearch"
      >
        <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="closeSearch" />

        <div
          class="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl border border-line overflow-hidden"
        >
          <div class="flex items-center gap-3 px-4 py-3.5 border-b border-line">
            <Icon name="heroicons:magnifying-glass" class="text-muted text-lg shrink-0" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              placeholder="Search docs..."
              class="flex-1 text-sm text-ink placeholder-muted outline-none bg-transparent"
              @keydown="onKeydown"
            />
            <button
              v-if="searchQuery"
              class="text-muted hover:text-ink transition-colors"
              @click="searchQuery = ''"
            >
              <Icon name="heroicons:x-mark" class="text-base" />
            </button>
            <kbd
              class="hidden sm:block text-[10px] text-muted border border-line-strong rounded px-1.5 py-0.5"
            >
              Esc
            </kbd>
          </div>

          <div ref="resultsContainerRef" class="max-h-[60vh] overflow-y-auto">
            <div
              v-if="searching"
              class="flex items-center justify-center py-10 text-muted text-sm gap-2"
            >
              <Icon name="heroicons:arrow-path" class="text-base animate-spin" />
              Loading...
            </div>
            <div v-else-if="!debouncedQuery.trim()" class="py-8 text-center text-muted text-sm">
              Type to search across all docs
            </div>
            <div v-else-if="searchResults.length === 0" class="py-8 text-center text-muted text-sm">
              No results for <span class="text-ink font-medium">"{{ debouncedQuery }}"</span>
            </div>
            <ul v-else class="py-2">
              <li v-for="(result, i) in searchResults" :key="result.id" :data-result-index="i">
                <NuxtLink
                  :to="result.id"
                  class="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors group"
                  :class="i === selectedIndex ? 'bg-accent-soft' : 'hover:bg-subtle'"
                  @mouseenter="selectedIndex = i"
                  @click="closeSearch"
                >
                  <div
                    class="flex items-center justify-center w-6 h-6 rounded-md shrink-0 mt-0.5 bg-accent-soft text-accent"
                  >
                    <Icon
                      :name="result.level === 1 ? 'heroicons:document-text' : 'heroicons:hashtag'"
                      class="text-sm"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p v-if="result.titles?.length" class="text-xs text-muted truncate mb-0.5">
                      {{ result.titles.join(' › ') }}
                    </p>
                    <p class="text-sm font-semibold text-ink truncate">{{ result.title }}</p>
                    <p
                      v-if="result.snippet"
                      class="text-xs text-muted mt-0.5 line-clamp-2 leading-relaxed"
                    >
                      {{ result.snippet }}
                    </p>
                  </div>
                  <Icon
                    name="heroicons:arrow-right"
                    class="text-line-strong group-hover:text-muted text-sm mt-0.5 shrink-0 transition-colors"
                  />
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div
            class="border-t border-line px-4 py-2.5 flex items-center gap-3 text-[11px] text-muted"
          >
            <span class="flex items-center gap-1">
              <kbd class="border border-line-strong rounded px-1">↑↓</kbd> navigate
            </span>
            <span class="flex items-center gap-1">
              <kbd class="border border-line-strong rounded px-1">↵</kbd> open
            </span>
            <span class="flex items-center gap-1">
              <kbd class="border border-line-strong rounded px-1">Esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
