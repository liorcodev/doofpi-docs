<script setup lang="ts">
import Fuse from 'fuse.js';
import { getFallbackChain } from '~/composables/useDocsVersion';

const route = useRoute();
const { currentVersion } = useDocsVersion();
const isScrolled = ref(false);
const { isOpen: mobileOpen, toggle: toggleMobileMenu } = useMobileMenu();

// Local state for homepage mobile menu
const homeMenuOpen = ref(false);

// Computed property to determine which menu state to use
const isDocsPage = computed(() => route.path.startsWith('/docs'));
const handleMobileMenuClick = () => {
  if (isDocsPage.value) {
    toggleMobileMenu();
  } else {
    homeMenuOpen.value = !homeMenuOpen.value;
  }
};

// Close homepage menu when navigating
watch(
  () => route.path,
  () => {
    homeMenuOpen.value = false;
  }
);

// ── Search ─────────────────────────────────────────────
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

type ScoredSearchResult = SearchSection & {
  score: number;
  highlightedTitle: string;
  highlightedContent: string;
};

let allSections: SearchSection[] = [];
let fuse: Fuse<SearchSection> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Extract context around match for highlighting
function extractContext(
  text: string,
  indices: readonly [number, number][],
  maxLength = 150
): string {
  if (!text || !indices || indices.length === 0) {
    return text.slice(0, maxLength);
  }

  // Find the first match position
  const firstMatch = indices[0];
  if (!firstMatch) {
    return text.slice(0, maxLength);
  }
  const matchPos = firstMatch[0];

  // Extract context around match
  let start = 0;
  let end = text.length;

  if (text.length > maxLength) {
    start = Math.max(0, matchPos - 40);
    end = Math.min(text.length, matchPos + maxLength - 40);

    // Adjust to word boundaries
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
  if (end < text.length) result = result + '...';

  return result;
}

const searchResults = computed<ScoredSearchResult[]>(() => {
  const q = debouncedQuery.value.trim();
  if (!q || !fuse) return [];

  const results = fuse.search(q, { limit: 12 });

  return results.map(result => {
    const { item, score = 0, matches = [] } = result;

    // Find content match for context extraction
    const contentMatch = matches.find(m => m.key === 'content');
    const highlightedContent = contentMatch
      ? extractContext(item.content, contentMatch.indices)
      : item.content.slice(0, 150);

    return {
      ...item,
      score: (1 - score) * 10, // Convert Fuse score (lower is better) to our scale (higher is better)
      highlightedTitle: item.title,
      highlightedContent
    };
  });
});

// Parse the version and page slug out of a section id like
// "/docs/v1.0.0/core-concepts/routing" or "/docs/v1.0.0/routing#hash"
function parseSectionId(id: string): { version: string; slug: string } {
  const path = id.split('#')[0] ?? id;
  const parts = path.split('/').filter(Boolean); // ['docs','v1.0.0','core-concepts','routing']
  return { version: parts[1] ?? '', slug: parts.slice(2).join('/') };
}

// Reset cache when version changes so next open searches the right content
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

    // For each page slug, keep only the section from the highest-priority version
    // (mirrors the fallback logic in [...slug].vue)
    const winnerMap = new Map<string, string>(); // slug -> winning version
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

    // Initialize Fuse.js with weighted search keys
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

// Debounce search query
watch(searchQuery, newQuery => {
  selectedIndex.value = 0;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Immediate update for empty query or very short queries
  if (!newQuery.trim() || newQuery.length <= 2) {
    debouncedQuery.value = newQuery;
    return;
  }

  // Debounce longer queries
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

function resultPath(result: SearchSection): string {
  // result.id is already the full path e.g. "/docs/introduction" or "/docs/introduction#heading"
  return result.id;
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
    navigateTo(resultPath(searchResults.value[selectedIndex.value]!));
    closeSearch();
  }
}

function scrollToSelectedResult() {
  nextTick(() => {
    if (!resultsContainerRef.value) return;

    // Find the selected element by its data attribute or class
    const selectedElement = resultsContainerRef.value.querySelector(
      `[data-result-index="${selectedIndex.value}"]`
    );
    if (!selectedElement) return;

    const container = resultsContainerRef.value;
    const elementRect = selectedElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Check if element is outside visible area
    if (elementRect.bottom > containerRect.bottom) {
      // Scroll down to show element at bottom
      selectedElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else if (elementRect.top < containerRect.top) {
      // Scroll up to show element at top
      selectedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  };
  window.addEventListener('keydown', handler);
  onUnmounted(() => {
    window.removeEventListener('keydown', handler);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  });
});

// ── Scroll ─────────────────────────────────────────────
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 8;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  onUnmounted(() => window.removeEventListener('scroll', handleScroll));
});
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="
      isScrolled
        ? 'bg-white/90 backdrop-blur-xl border-b border-orange-100 shadow-sm shadow-orange-100/60'
        : 'bg-transparent'
    "
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <img src="/logo.svg" class="w-8 h-8" alt="doofpi logo" />
        <span class="text-slate-800 font-bold text-lg tracking-tight">
          doof<span class="text-orange-600">pi</span>
        </span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          to="/docs/introduction"
          class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          :class="
            route.path.startsWith('/docs')
              ? 'text-orange-700 bg-orange-50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          "
        >
          Docs
        </NuxtLink>
        <NuxtLink
          to="/docs/quick-start"
          class="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
        >
          Quick Start
        </NuxtLink>
        <NuxtLink
          to="/docs/api-reference/doofpi-class"
          class="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
        >
          API
        </NuxtLink>
      </nav>

      <!-- Right actions -->
      <div class="flex items-center gap-2">
        <!-- Search button -->
        <button
          class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50 transition-all duration-200 w-44"
          @click="openSearch"
        >
          <Icon name="heroicons:magnifying-glass" class="text-sm shrink-0" />
          <span class="flex-1 text-left">Search docs...</span>
          <span class="text-[10px] border border-slate-300 rounded px-1 py-0.5">⌘K</span>
        </button>
        <!-- npm badge -->
        <a
          href="https://www.npmjs.com/package/doofpi"
          target="_blank"
          rel="noopener"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50 transition-all duration-200"
        >
          <Icon name="simple-icons:npm" class="text-red-500 text-base" />
          doofpi
        </a>
        <!-- GitHub -->
        <a
          href="https://github.com/liorcodev/doofpi"
          target="_blank"
          rel="noopener"
          class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50 transition-all duration-200"
        >
          <Icon name="simple-icons:github" class="text-base" />
        </a>
        <!-- Mobile search icon -->
        <button
          class="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 border border-slate-200 bg-white transition-colors"
          @click="openSearch"
        >
          <Icon name="heroicons:magnifying-glass" class="text-base" />
        </button>
        <!-- Mobile toggle -->
        <button
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
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

  <!-- ── Homepage Mobile Menu ─────────────────────────── -->
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
      class="fixed top-16 left-0 right-0 z-40 md:hidden bg-white border-b border-slate-200 shadow-lg"
    >
      <nav class="flex flex-col py-2 px-4">
        <NuxtLink
          to="/docs/introduction"
          class="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-colors"
        >
          Docs
        </NuxtLink>
        <NuxtLink
          to="/docs/quick-start"
          class="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-colors"
        >
          Quick Start
        </NuxtLink>
        <NuxtLink
          to="/docs/api-reference/doofpi-class"
          class="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-colors"
        >
          API
        </NuxtLink>
      </nav>
    </div>
  </Transition>

  <!-- ── Search Modal ─────────────────────────────────── -->
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
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeSearch" />

        <!-- Panel -->
        <div
          class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200 overflow-hidden"
        >
          <!-- Input row -->
          <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
            <Icon name="heroicons:magnifying-glass" class="text-slate-400 text-lg shrink-0" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              placeholder="Search docs..."
              class="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              @keydown="onKeydown"
            />
            <button
              v-if="searchQuery"
              class="text-slate-400 hover:text-slate-600 transition-colors"
              @click="searchQuery = ''"
            >
              <Icon name="heroicons:x-mark" class="text-base" />
            </button>
            <kbd
              class="hidden sm:block text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5"
              >Esc</kbd
            >
          </div>

          <!-- Results -->
          <div ref="resultsContainerRef" class="max-h-[60vh] overflow-y-auto">
            <!-- Loading initial sections -->
            <div
              v-if="searching"
              class="flex items-center justify-center py-10 text-slate-400 text-sm gap-2"
            >
              <Icon name="heroicons:arrow-path" class="text-base animate-spin" />
              Loading...
            </div>

            <!-- Empty query -->
            <div v-else-if="!debouncedQuery.trim()" class="py-8 text-center text-slate-400 text-sm">
              Type to search across all docs
            </div>

            <!-- No results -->
            <div
              v-else-if="searchResults.length === 0"
              class="py-8 text-center text-slate-400 text-sm"
            >
              No results for <span class="text-slate-600 font-medium">"{{ debouncedQuery }}"</span>
            </div>

            <!-- Results list -->
            <ul v-else class="py-2">
              <li v-for="(result, i) in searchResults" :key="result.id" :data-result-index="i">
                <NuxtLink
                  :to="resultPath(result)"
                  class="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors group"
                  :class="i === selectedIndex ? 'bg-orange-50' : 'hover:bg-slate-50'"
                  @mouseenter="selectedIndex = i"
                  @click="closeSearch"
                >
                  <div
                    class="flex items-center justify-center w-6 h-6 rounded-md shrink-0 mt-0.5"
                    :class="
                      result.score > 8
                        ? 'bg-orange-100 text-orange-600'
                        : result.score > 4
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-slate-50 text-slate-400'
                    "
                  >
                    <Icon
                      :name="result.level === 1 ? 'heroicons:document-text' : 'heroicons:hashtag'"
                      class="text-sm"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-slate-400 truncate mb-0.5" v-if="result.titles?.length">
                      {{ result.titles.join(' › ') }}
                    </p>
                    <p class="text-sm font-semibold text-slate-800 truncate">
                      {{ result.highlightedTitle }}
                    </p>
                    <p
                      v-if="result.highlightedContent"
                      class="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed"
                    >
                      {{ result.highlightedContent }}
                    </p>
                  </div>
                  <Icon
                    name="heroicons:arrow-right"
                    class="text-slate-300 group-hover:text-slate-400 text-sm mt-0.5 shrink-0 transition-colors"
                  />
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Footer hint -->
          <div
            class="border-t border-slate-100 px-4 py-2.5 flex items-center gap-3 text-[11px] text-slate-400"
          >
            <span class="flex items-center gap-1"
              ><kbd class="border border-slate-200 rounded px-1">↑↓</kbd> navigate</span
            >
            <span class="flex items-center gap-1"
              ><kbd class="border border-slate-200 rounded px-1">↵</kbd> open</span
            >
            <span class="flex items-center gap-1"
              ><kbd class="border border-slate-200 rounded px-1">Esc</kbd> close</span
            >
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
