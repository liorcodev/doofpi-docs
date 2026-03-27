<template>
  <footer class="border-t border-orange-100 bg-white py-12">
    <div
      class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div class="flex items-center gap-2.5">
        <img src="/logo.svg" class="w-7 h-7" alt="doofpi" />
        <span class="text-slate-700 text-sm font-medium">
          doof<span class="text-orange-600">pi</span>
          <span class="ml-2 text-slate-400">· Edge-First TypeScript API Framework</span>
        </span>
      </div>
      <div class="flex items-center gap-6 text-sm text-slate-500">
        <NuxtLink to="/docs/introduction" class="hover:text-slate-700 transition-colors"
          >Docs</NuxtLink
        >
        <NuxtLink to="/docs/quick-start" class="hover:text-slate-700 transition-colors"
          >Quick Start</NuxtLink
        >
        <NuxtLink to="/docs/comparison" class="hover:text-slate-700 transition-colors"
          >Comparison</NuxtLink
        >
        <a
          href="https://github.com/liorcodev/doofpi"
          target="_blank"
          rel="noopener"
          class="hover:text-slate-700 transition-colors flex items-center gap-1"
        >
          <Icon name="simple-icons:github" class="text-base" /> GitHub
        </a>
      </div>
    </div>
  </footer>
</template>
