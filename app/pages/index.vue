<script setup lang="ts">
definePageMeta({ layout: 'default' });
useHead({ title: 'doofpi - Type-safe APIs. Zero boilerplate.' });

const { latestVersion } = useDocsVersion();

const copied = ref(false);
function copyInstall() {
  navigator.clipboard.writeText('bun add doofpi');
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

const serverCode = `\`\`\`typescript
// Define your routes
const appRoute = d.routes({
  greeting: d.endpointBuilder
    .model({
      input:  z.object({
        name: z.string()
      }),
      output: z.object({
        message: z.string()
      })
    })
    .write(({ input }) => ({
      message: \`Hello, \${input.name}!\`
    }))
})

// Export ONLY the type
export type AppRoute = typeof appRoute
\`\`\``;

const clientCode = `\`\`\`typescript
import { createClient } from 'doofpi'
import type { AppRoute } from './server'

const client = createClient<AppRoute>({
  url: 'http://localhost:3000',
  root: '/api'
})

// Full type safety: routes, inputs, outputs
const res = await client.greeting
  .write({ name: 'Developer' })

// res.message → "Hello, Developer!"
\`\`\``;

const webStandardCode = `\`\`\`typescript
// Define your API
const d = new Doofpi()
const appRoute = d.routes({ /* ... */ })
d.register(appRoute)

// Export for any runtime
export default { fetch: d.fetch }
\`\`\``;

const features = [
  {
    icon: 'heroicons:bolt',
    title: 'Zero Boilerplate',
    desc: 'No adapters, no generated files, no configuration. Write handlers, register routes, ship - doofpi gets out of your way.'
  },
  {
    icon: 'heroicons:globe-alt',
    title: 'Web Standards Compatible',
    desc: 'Built on the Web Standards Request/Response API. Works with any runtime that supports the Fetch API standard.'
  },
  {
    icon: 'heroicons:shield-check',
    title: 'Input + Output Validation',
    desc: 'Optional Zod validation for inputs and outputs. Validate what clients send and prevent accidental data leaks.'
  },
  {
    icon: 'heroicons:code-bracket',
    title: 'End-to-End Type Safety',
    desc: "TypeScript knows every endpoint's input and output. No codegen. No schema files. Pure inference."
  },
  {
    icon: 'heroicons:sparkles',
    title: 'Tiny Footprint',
    desc: 'One runtime dependency: extreme-router. Zod is optional - but when you add it, you get both runtime validation and full TypeScript inference for inputs and outputs at no extra wiring cost.'
  },
  {
    icon: 'heroicons:rocket-launch',
    title: 'Blazing Fast Routing',
    desc: 'Powered by <a href="https://github.com/liorcodev/extreme-router" target="_blank" rel="noopener" class="text-accent hover:underline font-medium">extreme-router</a> - O(1) static lookups for lightning-fast route matching. No regex, no iteration, just direct hash-based routing.'
  },
  {
    icon: 'heroicons:variable',
    title: 'Typed Env & Runtime',
    desc: "defineEnv<{...}>() types your env vars and platform bindings (KV, D1, R2). defineExtra<T>() types runtime-specific data like Cloudflare's ExecutionContext or Bun's Server - all flowing into every handler."
  },
  {
    icon: 'heroicons:puzzle-piece',
    title: 'Split Routes, Zero Ceremony',
    desc: 'Compose routes across any number of files without exporting a type from each one. doofpi infers the full route tree automatically - no per-file type exports needed.'
  },
  {
    icon: 'heroicons:fire',
    title: 'Global Lifecycle Hooks',
    desc: 'Hook into every request with onRequest, every response with onResponse, and every error with onError - set once globally, no per-endpoint configuration needed.'
  }
];

const stats = [
  { value: '1', label: 'runtime dependency' },
  { value: '0', label: 'code generation steps' },
  { value: 'O(1)', label: 'static route lookups' },
  { value: '5', label: 'edge runtimes' }
];

const runtimes = [
  { name: 'Bun', icon: 'i-logos:bun' },
  { name: 'Cloudflare', icon: 'i-logos:cloudflare-workers-icon' },
  { name: 'Vercel', icon: 'i-logos:vercel-icon' },
  { name: 'Deno', icon: 'i-logos:deno' },
  { name: 'Netlify', icon: 'i-logos:netlify-icon' }
];

const trpcMap = [
  { from: 'procedure', to: 'EndpointBuilder' },
  { from: 'router({...})', to: 'd.routes({...})' },
  { from: '.query()', to: '.read()' },
  { from: '.mutation()', to: '.write()' },
  { from: 'procedure.meta()', to: '.meta()' },
  { from: 'procedure.use()', to: '.middleware()' }
];
</script>

<template>
  <div class="relative overflow-x-hidden">
    <!-- Hero -->
    <section class="relative flex flex-col items-center justify-center px-4 pt-24 pb-28 sm:pt-32">
      <div class="grid-bg absolute inset-0" />
      <div
        class="absolute -top-24 left-1/2 -translate-x-1/2 w-[60rem] h-[28rem] rounded-full bg-brand-400/20 blur-3xl"
      />

      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <NuxtLink
          to="/docs/quick-start"
          class="animate-fade-up inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full text-xs font-semibold bg-surface border border-line-strong text-body hover:border-brand-400 transition-colors shadow-sm"
        >
          <span class="px-2 py-0.5 rounded-full bg-accent-soft text-accent">
            {{ latestVersion }}
          </span>
          Edge-First TypeScript API Framework
          <Icon name="heroicons:arrow-right" class="text-accent" />
        </NuxtLink>

        <h1
          class="animate-fade-up mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-ink"
          style="animation-delay: 80ms"
        >
          Build <span class="gradient-text">Type-Safe APIs</span><br />
          Zero Boilerplate
        </h1>

        <p
          class="animate-fade-up mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
          style="animation-delay: 160ms"
        >
          Define your API once in TypeScript, ship to the edge with no code generation, no adapters
          and no complexity.
        </p>

        <div
          class="animate-fade-up mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
          style="animation-delay: 240ms"
        >
          <NuxtLink
            to="/docs/introduction"
            class="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold"
          >
            Get Started
            <Icon name="heroicons:arrow-right" class="text-lg" />
          </NuxtLink>
          <button
            class="btn-secondary inline-flex items-center gap-3 px-5 py-3.5 rounded-xl font-mono text-sm"
            @click="copyInstall"
          >
            <span class="text-muted">$</span> bun add doofpi
            <Icon
              :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'"
              class="text-base"
              :class="copied ? 'text-accent' : 'text-muted'"
            />
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div
        class="animate-fade-up relative z-10 mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl"
        style="animation-delay: 320ms"
      >
        <div v-for="s in stats" :key="s.label" class="card px-4 py-5 text-center">
          <p class="text-3xl font-extrabold text-ink">{{ s.value }}</p>
          <p class="mt-1 text-xs text-muted">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-24 px-4 bg-subtle border-y border-line">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-14 reveal">
          <span
            class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-soft text-accent border border-brand-200"
          >
            How it works
          </span>
          <h2 class="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">
            Define once. <span class="gradient-text">Use everywhere.</span>
          </h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Create your API on the server, export the type, and get full type safety on the client.
            No code generation, no sync step.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6 reveal">
          <div class="card overflow-hidden min-w-0">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-line bg-canvas">
              <Icon name="heroicons:server-stack" class="text-accent" />
              <span class="text-sm font-mono font-semibold text-ink">server.ts</span>
            </div>
            <div class="px-4 overflow-x-auto prose"><MDC :value="serverCode" /></div>
          </div>
          <div class="card overflow-hidden min-w-0">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-line bg-canvas">
              <Icon name="heroicons:computer-desktop" class="text-accent" />
              <span class="text-sm font-mono font-semibold text-ink">client.ts</span>
            </div>
            <div class="px-4 overflow-x-auto prose"><MDC :value="clientCode" /></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-24 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14 reveal">
          <span
            class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-soft text-accent border border-brand-200"
          >
            Why doofpi
          </span>
          <h2 class="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">
            Everything you need, <span class="gradient-text">nothing you don't</span>
          </h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            A minimalist API framework with zero compromise on developer experience or type safety.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="card card-hover p-6 reveal"
            :style="{ '--reveal-delay': `${(i % 3) * 80}ms` }"
          >
            <div
              class="w-11 h-11 rounded-xl bg-linear-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-600/25"
            >
              <Icon :name="f.icon" class="text-xl" />
            </div>
            <h3 class="mt-5 text-lg font-bold text-ink">{{ f.title }}</h3>
            <p class="mt-2 text-sm text-muted leading-relaxed" v-html="f.desc" />
          </div>
        </div>
      </div>
    </section>

    <!-- Web standards -->
    <section class="py-24 px-4 bg-subtle border-y border-line">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-14 reveal">
          <span
            class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-soft text-accent border border-brand-200"
          >
            Web Standards Compatible
          </span>
          <h2 class="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">
            Request in. <span class="gradient-text">Response out.</span>
          </h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Built on the Web Fetch API standard. Write once, deploy to the edge.
          </p>
        </div>

        <div class="max-w-3xl mx-auto">
          <div class="card overflow-hidden min-w-0 reveal">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-line bg-canvas">
              <Icon name="heroicons:document-text" class="text-accent" />
              <span class="text-sm font-mono font-semibold text-ink">index.ts</span>
            </div>
            <div class="px-4 overflow-x-auto prose"><MDC :value="webStandardCode" /></div>
          </div>

          <div
            class="reveal mt-12 flex items-center justify-center gap-3 sm:gap-6 text-center overflow-x-auto px-4"
          >
            <div class="flex-1 min-w-20">
              <div
                class="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent-soft text-accent border border-brand-200 mb-3"
              >
                <Icon name="heroicons:arrow-down-tray" class="text-lg sm:text-2xl" />
              </div>
              <div class="text-xs sm:text-sm font-bold text-ink">Request</div>
              <div class="text-xs text-muted hidden sm:block">Standard Web API</div>
            </div>
            <Icon name="heroicons:arrow-right" class="text-xl sm:text-2xl text-accent shrink-0" />
            <div class="flex-1 min-w-20">
              <div
                class="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-brand-500 to-brand-700 text-white mb-3 shadow-lg shadow-brand-600/25"
              >
                <Icon name="heroicons:bolt" class="text-lg sm:text-2xl" />
              </div>
              <div class="text-xs sm:text-sm font-bold text-ink">d.fetch()</div>
              <div class="text-xs text-muted hidden sm:block">Your typed API</div>
            </div>
            <Icon name="heroicons:arrow-right" class="text-xl sm:text-2xl text-accent shrink-0" />
            <div class="flex-1 min-w-20">
              <div
                class="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent-soft text-accent border border-brand-200 mb-3"
              >
                <Icon name="heroicons:arrow-up-tray" class="text-lg sm:text-2xl" />
              </div>
              <div class="text-xs sm:text-sm font-bold text-ink">Response</div>
              <div class="text-xs text-muted hidden sm:block">Standard Web API</div>
            </div>
          </div>

          <div class="mt-16 reveal">
            <p class="text-xs font-bold text-muted uppercase tracking-widest mb-6 text-center">
              Deploy to the edge, same code
            </p>
            <div class="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div v-for="r in runtimes" :key="r.name" class="flex flex-col items-center gap-2">
                <div
                  class="card card-hover w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center"
                >
                  <Icon :name="r.icon" class="text-3xl sm:text-4xl" />
                </div>
                <span class="text-xs font-semibold text-body">{{ r.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- tRPC -->
    <section class="py-24 px-4">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-12 reveal">
          <span
            class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-soft text-accent border border-brand-200"
          >
            tRPC-inspired
          </span>
          <h2 class="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">
            Familiar patterns, <span class="gradient-text">simplified</span>
          </h2>
          <p class="mt-4 text-lg text-muted">
            Coming from
            <a
              href="https://trpc.io"
              target="_blank"
              rel="noopener"
              class="text-accent hover:underline font-semibold"
              >tRPC</a
            >? Same concepts, less configuration.
          </p>
        </div>

        <div class="max-w-3xl mx-auto flex flex-col gap-3">
          <div
            v-for="(row, i) in trpcMap"
            :key="row.from"
            class="card card-hover reveal grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 min-w-0"
            :style="{ '--reveal-delay': `${i * 50}ms` }"
          >
            <span class="text-muted text-right font-mono text-xs sm:text-sm truncate">
              {{ row.from }}
            </span>
            <div
              class="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0"
            >
              <Icon name="heroicons:arrow-right" class="text-sm" />
            </div>
            <span class="text-ink font-semibold font-mono text-xs sm:text-sm truncate">
              {{ row.to }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="pb-24 px-4">
      <div
        class="reveal relative max-w-4xl mx-auto rounded-3xl overflow-hidden px-8 py-16 text-center text-white bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 shadow-2xl shadow-brand-700/30"
      >
        <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div class="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-brand-300/20 blur-2xl" />
        <div class="relative">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to ship?</h2>
          <p class="mt-3 text-brand-100 max-w-xl mx-auto">
            Full type safety, Web Standards compatible, zero ceremony. Start building in under 5
            minutes.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <NuxtLink
              to="/docs/quick-start"
              class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-brand-800 font-semibold hover:bg-brand-50 transition-colors"
            >
              Quick Start <Icon name="heroicons:arrow-right" />
            </NuxtLink>
            <a
              href="https://github.com/liorcodev/doofpi"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <Icon name="simple-icons:github" /> GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
