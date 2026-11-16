<script setup lang="ts">
const route = useRoute();
const { currentVersion, versions } = useDocsVersion();
const { isOpen: mobileOpen, close: closeMobileMenu } = useMobileMenu();
const versionOpen = ref(false);

const navigation = computed(() =>
  getDocsNav(currentVersion.value).map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      to: `/docs/${currentVersion.value}/${item.slug}`
    }))
  }))
);

const STORAGE_KEY = 'doofpi-docs-version';

function switchVersion(v: string) {
  versionOpen.value = false;
  sessionStorage.setItem(STORAGE_KEY, v);
  const segments = route.path.split('/').filter(Boolean);
  const pagePath = segments.slice(2).join('/');
  navigateTo(`/docs/${v}/${pagePath || 'introduction'}`);
}
</script>

<template>
  <div
    v-if="mobileOpen"
    class="lg:hidden fixed inset-0 bg-ink/30 backdrop-blur-sm z-30 top-16"
    @click="closeMobileMenu"
  />

  <aside
    class="fixed top-16 left-0 bottom-0 w-64 flex flex-col overflow-y-auto border-r border-line bg-canvas px-4 py-6 z-40 transition-transform duration-300 ease-in-out"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <div class="relative mb-5">
      <div v-if="versionOpen" class="fixed inset-0 z-40" @click="versionOpen = false" />
      <button
        class="relative z-50 w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border border-line-strong hover:border-brand-400 bg-surface hover:bg-accent-soft transition-all duration-150 text-ink font-medium"
        @click="versionOpen = !versionOpen"
      >
        <div class="flex items-center gap-2">
          <Icon name="heroicons:tag" class="text-accent text-sm shrink-0" />
          <span>{{ currentVersion }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            v-if="currentVersion === versions[0]"
            class="text-[10px] bg-accent-soft text-accent px-1.5 py-0.5 rounded font-semibold"
          >
            latest
          </span>
          <Icon
            name="heroicons:chevron-down"
            class="text-muted text-sm transition-transform duration-150"
            :class="versionOpen ? 'rotate-180' : ''"
          />
        </div>
      </button>
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 translate-y-1 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-95"
      >
        <div
          v-if="versionOpen"
          class="absolute top-full mt-1 left-0 right-0 bg-surface border border-line-strong rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <button
            v-for="v in versions"
            :key="v"
            class="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent-soft transition-colors"
            :class="v === currentVersion ? 'text-accent font-semibold' : 'text-body'"
            @click="switchVersion(v)"
          >
            <div class="flex items-center gap-2">
              <Icon
                v-if="v === currentVersion"
                name="heroicons:check"
                class="text-accent text-sm"
              />
              <span v-else class="w-4 inline-block" />
              {{ v }}
            </div>
            <span
              v-if="v === versions[0]"
              class="text-[10px] bg-accent-soft text-accent px-1.5 py-0.5 rounded font-semibold"
            >
              latest
            </span>
          </button>
        </div>
      </Transition>
    </div>

    <nav class="flex flex-col gap-6">
      <div v-for="section in navigation" :key="section.group">
        <p class="px-3 mb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-muted">
          {{ section.group }}
        </p>
        <ul class="flex flex-col gap-0.5">
          <li v-for="item in section.items" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              :class="
                route.path === item.to
                  ? 'bg-accent-soft text-accent border border-brand-200'
                  : 'text-body hover:text-ink hover:bg-subtle border border-transparent'
              "
              @click="closeMobileMenu"
            >
              <span
                class="w-1 h-1 rounded-full shrink-0"
                :class="route.path === item.to ? 'bg-brand-600' : 'bg-transparent'"
              />
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>
