<script setup lang="ts">
definePageMeta({ layout: 'default' });
useHead({ title: 'doofpi - Type-safe APIs. Zero boilerplate.' });

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
    bg: 'bg-linear-to-br from-orange-500 to-orange-600',
    title: 'Zero Boilerplate',
    desc: 'No adapters, no generated files, no configuration. Write handlers, register routes, ship - doofpi gets out of your way.'
  },
  {
    icon: 'heroicons:globe-alt',
    bg: 'bg-linear-to-br from-orange-600 to-red-600',
    title: 'Web Standards Compatible',
    desc: 'Built on the Web Standards Request/Response API. Works with any runtime that supports the Fetch API standard.'
  },
  {
    icon: 'heroicons:shield-check',
    bg: 'bg-linear-to-br from-amber-500 to-orange-600',
    title: 'Input + Output Validation',
    desc: 'Optional Zod validation for inputs and outputs. Validate what clients send and prevent accidental data leaks.'
  },
  {
    icon: 'heroicons:code-bracket',
    bg: 'bg-linear-to-br from-orange-500 to-orange-700',
    title: 'End-to-End Type Safety',
    desc: "TypeScript knows every endpoint's input and output. No codegen. No schema files. Pure inference."
  },
  {
    icon: 'heroicons:sparkles',
    bg: 'bg-linear-to-br from-orange-400 to-orange-500',
    title: 'Tiny Footprint',
    desc: 'One runtime dependency: extreme-router. Zod is optional - but when you add it, you get both runtime validation and full TypeScript inference for inputs and outputs at no extra wiring cost.'
  },
  {
    icon: 'heroicons:rocket-launch',
    bg: 'bg-linear-to-br from-red-500 to-orange-600',
    title: 'Blazing Fast Routing',
    desc: 'Powered by <a href="https://github.com/liorcodev/extreme-router" target="_blank" rel="noopener" class="text-orange-600 hover:underline font-medium">extreme-router</a> - O(1) static lookups for lightning-fast route matching. No regex, no iteration, just direct hash-based routing.'
  },
  {
    icon: 'heroicons:variable',
    bg: 'bg-linear-to-br from-amber-600 to-orange-600',
    title: 'Typed Env & Runtime',
    desc: "defineEnv<{...}>() types your env vars and platform bindings (KV, D1, R2). defineExtra<T>() types runtime-specific data like Cloudflare's ExecutionContext or Bun's Server - all flowing into every handler."
  },
  {
    icon: 'heroicons:puzzle-piece',
    bg: 'bg-linear-to-br from-orange-500 to-red-500',
    title: 'Split Routes, Zero Ceremony',
    desc: 'Compose routes across any number of files without exporting a type from each one. doofpi infers the full route tree automatically - no per-file type exports needed.'
  },
  {
    icon: 'heroicons:fire',
    bg: 'bg-linear-to-br from-orange-600 to-red-600',
    title: 'Global Lifecycle Hooks',
    desc: 'Hook into every request with onRequest, every response with onResponse, and every error with onError - set once globally, no per-endpoint configuration needed.'
  }
];
</script>

<template>
  <div class="relative bg-white overflow-x-hidden">
    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section
      class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-12 bg-linear-to-b from-orange-50/40 via-white to-amber-50/20"
    >
      <!-- Animated background blobs -->
      <div
        class="absolute -top-10 -left-10 w-125 h-125 bg-orange-500/15 rounded-full blur-2xl animate-glow-pulse"
      />
      <div
        class="absolute top-20 -right-20 w-80 h-80 bg-red-500/20 rounded-full blur-xl animate-glow-pulse"
        style="animation-delay: 2s"
      />
      <div
        class="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-500/15 rounded-full blur-2xl animate-glow-pulse"
        style="animation-delay: 1s"
      />
      <div
        class="absolute -bottom-10 -right-10 w-150 h-150 bg-linear-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl animate-glow-pulse"
        style="animation-delay: 3s"
      />

      <div class="relative z-10 max-w-7xl mx-auto w-full">
        <!-- Top section: Badge + Headline + Subtitle -->
        <div class="text-center mb-12">
          <!-- Badge -->
          <div class="animate-slide-in-scale delay-100 mb-6">
            <span
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-linear-to-r from-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/40"
            >
              <Icon name="heroicons:sparkles" class="text-base" />
              Edge-First TypeScript API Framework
            </span>
          </div>

          <!-- Headline -->
          <h1
            class="animate-slide-in-scale delay-200 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.05] mb-6"
          >
            <span class="text-slate-900">Build</span>
            <span class="gradient-text"> Type-Safe APIs</span><br />
            <span class="text-slate-700">Zero Boilerplate</span>
          </h1>

          <!-- Subtitle -->
          <p
            class="animate-slide-in-scale delay-300 text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto mb-6 leading-relaxed font-medium"
          >
            Define your API once in TypeScript, ship to the edge with
            <span class="text-orange-600 font-bold">no code generation</span>,
            <span class="text-orange-600 font-bold">no adapters</span>,
            <span class="text-orange-600 font-bold">no complexity</span>.
          </p>

          <!-- CTAs -->
          <div
            class="animate-slide-in-scale delay-600 flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <NuxtLink
              to="/docs/introduction"
              class="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base shadow-2xl shadow-orange-500/30 hover:scale-105 transition-transform"
            >
              <Icon name="heroicons:rocket-launch" class="text-lg" />
              Get Started
              <Icon name="heroicons:arrow-right" class="text-lg" />
            </NuxtLink>
            <NuxtLink
              to="/docs/quick-start"
              class="btn-outline inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base hover:scale-105 transition-transform"
            >
              <Icon name="heroicons:play" class="text-lg" />
              Quick Start
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float z-10">
        <div
          class="w-6 h-10 rounded-full border-2 border-orange-400 flex items-start justify-center pt-2"
        >
          <div class="w-1.5 h-2.5 rounded-full bg-orange-500 animate-bounce" />
        </div>
      </div>
    </section>

    <!-- ─── How It Works ─────────────────────────────────── -->
    <section class="py-32 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-block mb-4">
            <span
              class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-orange-100 text-orange-700 border border-orange-300"
            >
              How It Works
            </span>
          </div>
          <h2
            class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6"
          >
            Define once. <span class="gradient-text">Use everywhere.</span>
          </h2>
          <p class="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Create your API on the server, export the type, and get full type safety on the client.
            No code generation, no sync step, no complexity.
          </p>
        </div>

        <!-- Code preview -->
        <div class="grid md:grid-cols-2 gap-8 text-left max-w-6xl mx-auto">
          <!-- Server -->
          <div class="relative group min-w-0">
            <div
              class="absolute -inset-1 bg-linear-to-r from-orange-400 to-red-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500"
            ></div>
            <div
              class="relative bg-white rounded-3xl overflow-hidden border-2 border-orange-200/70 shadow-2xl group-hover:border-orange-300 transition-all min-w-0"
            >
              <div
                class="bg-linear-to-br from-orange-50 via-white to-amber-50 px-4 sm:px-6 py-4 border-b-2 border-orange-200/50"
              >
                <div class="flex items-center gap-3">
                  <div class="flex gap-1.5">
                    <div
                      class="w-3 h-3 rounded-full bg-red-400 shadow-sm ring-1 ring-red-500/20"
                    ></div>
                    <div
                      class="w-3 h-3 rounded-full bg-amber-400 shadow-sm ring-1 ring-amber-500/20"
                    ></div>
                    <div
                      class="w-3 h-3 rounded-full bg-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
                    ></div>
                  </div>
                  <div class="h-5 w-px bg-orange-200"></div>
                  <span class="text-sm font-mono font-bold text-slate-600">server.ts</span>
                </div>
              </div>
              <div
                class="p-4 sm:p-6 bg-linear-to-br from-white to-orange-50/30 overflow-x-auto max-w-full"
              >
                <div class="min-w-max sm:min-w-0">
                  <MDC :value="serverCode" />
                </div>
              </div>
            </div>
          </div>

          <!-- Client -->
          <div class="relative group min-w-0">
            <div
              class="absolute -inset-1 bg-linear-to-r from-orange-400 to-red-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500"
            ></div>
            <div
              class="relative bg-white rounded-3xl overflow-hidden border-2 border-orange-200/70 shadow-2xl group-hover:border-orange-300 transition-all min-w-0"
            >
              <div
                class="bg-linear-to-br from-orange-50 via-white to-amber-50 px-4 sm:px-6 py-4 border-b-2 border-orange-200/50"
              >
                <div class="flex items-center gap-3">
                  <div class="flex gap-1.5">
                    <div
                      class="w-3 h-3 rounded-full bg-red-400 shadow-sm ring-1 ring-red-500/20"
                    ></div>
                    <div
                      class="w-3 h-3 rounded-full bg-amber-400 shadow-sm ring-1 ring-amber-500/20"
                    ></div>
                    <div
                      class="w-3 h-3 rounded-full bg-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
                    ></div>
                  </div>
                  <div class="h-5 w-px bg-orange-200"></div>
                  <span class="text-sm font-mono font-bold text-slate-600">client.ts</span>
                </div>
              </div>
              <div
                class="p-4 sm:p-6 bg-linear-to-br from-white to-orange-50/30 overflow-x-auto max-w-full"
              >
                <div class="min-w-max sm:min-w-0">
                  <MDC :value="clientCode" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Features ──────────────────────────────────────── -->
    <section class="relative py-32 px-4 bg-white overflow-x-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-20">
          <div class="inline-block mb-4">
            <span
              class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-orange-100 text-orange-700 border border-orange-300"
            >
              Why doofpi
            </span>
          </div>
          <h2
            class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6"
          >
            Everything you need<br />
            <span class="gradient-text">Nothing you don't</span>
          </h2>
          <p class="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
            A minimalist API framework with zero compromise on developer experience or type safety
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="glass glass-hover p-8 relative overflow-hidden group"
            :style="`animation-delay:${i * 60}ms`"
          >
            <div class="relative z-10">
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform group-hover:scale-110"
                :class="f.bg"
              >
                <Icon :name="f.icon" class="text-white text-2xl" />
              </div>
              <h3 class="text-slate-900 font-bold text-lg mb-3">{{ f.title }}</h3>
              <p class="text-slate-600 text-sm leading-relaxed" v-html="f.desc"></p>
            </div>
            <div
              class="absolute -right-8 -bottom-8 w-32 h-32 bg-linear-to-br from-orange-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── How it works ──────────────────────────────────── -->
    <!-- ─── Deploy Anywhere ──────────────────────────────────── -->
    <section class="py-32 px-4 bg-linear-to-b from-orange-50 to-white overflow-x-hidden">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-block mb-4">
            <span
              class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-orange-700 border-2 border-orange-300 shadow-sm"
            >
              Web Standards Compatible
            </span>
          </div>
          <h2 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Request in. <span class="gradient-text">Response out.</span>
          </h2>
          <p class="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Built on the Web Fetch API standard. Write once, deploy to the edge.
          </p>
        </div>

        <!-- Main example -->
        <div class="max-w-3xl mx-auto">
          <div class="relative group">
            <div
              class="absolute -inset-2 bg-linear-to-r from-orange-400 to-red-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-500"
            ></div>
            <div
              class="relative bg-white rounded-3xl overflow-hidden border-2 border-orange-200/70 shadow-2xl"
            >
              <div
                class="bg-linear-to-br from-orange-50 via-white to-amber-50 px-6 py-4 border-b-2 border-orange-200/50"
              >
                <div class="flex items-center gap-3">
                  <div class="flex gap-1.5">
                    <div
                      class="w-3 h-3 rounded-full bg-red-400 shadow-sm ring-1 ring-red-500/20"
                    ></div>
                    <div
                      class="w-3 h-3 rounded-full bg-amber-400 shadow-sm ring-1 ring-amber-500/20"
                    ></div>
                    <div
                      class="w-3 h-3 rounded-full bg-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
                    ></div>
                  </div>
                  <div class="h-5 w-px bg-orange-200"></div>
                  <span class="text-sm font-mono font-bold text-slate-600">index.ts</span>
                </div>
              </div>
              <div class="p-4 sm:p-6 bg-linear-to-br from-white to-orange-50/30 overflow-x-auto">
                <MDC :value="webStandardCode" />
              </div>
            </div>
          </div>

          <!-- Flow visualization -->
          <div
            class="mt-12 flex items-center justify-center gap-3 sm:gap-6 text-center overflow-x-auto px-4"
          >
            <div class="flex-1 min-w-20">
              <div
                class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-orange-100 text-orange-600 mb-3"
              >
                <Icon name="heroicons:arrow-down-tray" class="text-lg sm:text-2xl" />
              </div>
              <div class="text-xs sm:text-sm font-bold text-slate-700">Request</div>
              <div class="text-xs text-slate-500 hidden sm:block">Standard Web API</div>
            </div>
            <div class="text-xl sm:text-3xl text-orange-500 font-bold shrink-0">→</div>
            <div class="flex-1 min-w-20">
              <div
                class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-orange-500 to-red-500 text-white mb-3 shadow-xl animate-pulse-glow"
              >
                <Icon name="heroicons:bolt" class="text-lg sm:text-2xl" />
              </div>
              <div class="text-xs sm:text-sm font-bold text-slate-900">d.fetch()</div>
              <div class="text-xs text-slate-500 hidden sm:block">Your typed API</div>
            </div>
            <div class="text-xl sm:text-3xl text-orange-500 font-bold shrink-0">→</div>
            <div class="flex-1 min-w-20">
              <div
                class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 text-amber-600 mb-3"
              >
                <Icon name="heroicons:arrow-up-tray" class="text-lg sm:text-2xl" />
              </div>
              <div class="text-xs sm:text-sm font-bold text-slate-700">Response</div>
              <div class="text-xs text-slate-500 hidden sm:block">Standard Web API</div>
            </div>
          </div>

          <!-- Runtime icons showcase -->
          <div class="mt-16">
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 text-center">
              Deploy to the edge, same code
            </p>
            <div class="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div class="group flex flex-col items-center gap-2">
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl group-hover:border-orange-400 transition-all duration-300"
                >
                  <Icon name="i-logos:bun" class="text-3xl sm:text-4xl" />
                </div>
                <span class="text-xs font-bold text-slate-600">Bun</span>
              </div>
              <div class="group flex flex-col items-center gap-2">
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl group-hover:border-orange-400 transition-all duration-300"
                >
                  <Icon name="i-logos:cloudflare-workers-icon" class="text-3xl sm:text-4xl" />
                </div>
                <span class="text-xs font-bold text-slate-600">Cloudflare</span>
              </div>
              <div class="group flex flex-col items-center gap-2">
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl group-hover:border-orange-400 transition-all duration-300"
                >
                  <Icon name="i-logos:vercel-icon" class="text-3xl sm:text-4xl" />
                </div>
                <span class="text-xs font-bold text-slate-600">Vercel</span>
              </div>
              <div class="group flex flex-col items-center gap-2">
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl group-hover:border-orange-400 transition-all duration-300"
                >
                  <Icon name="i-logos:deno" class="text-3xl sm:text-4xl" />
                </div>
                <span class="text-xs font-bold text-slate-600">Deno</span>
              </div>
              <div class="group flex flex-col items-center gap-2">
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl group-hover:border-orange-400 transition-all duration-300"
                >
                  <Icon name="i-logos:netlify-icon" class="text-3xl sm:text-4xl" />
                </div>
                <span class="text-xs font-bold text-slate-600">Netlify</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── tRPC Comparison ───────────────────────────────────── -->
    <section class="py-28 px-4 bg-white border-t-2 border-orange-100">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-12">
          <span
            class="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
          >
            tRPC-inspired
          </span>
          <h2
            class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4 leading-tight"
          >
            Familiar patterns, simplified
          </h2>
          <p class="text-slate-600 text-lg">
            Coming from
            <a
              href="https://trpc.io"
              target="_blank"
              rel="noopener"
              class="text-orange-600 hover:underline font-semibold"
              >tRPC</a
            >? Same concepts, less configuration.
          </p>
        </div>

        <div class="max-w-3xl mx-auto flex flex-col gap-3 mb-16">
          <div
            v-for="row in [
              { from: 'procedure', to: 'EndpointBuilder' },
              { from: 'router({...})', to: 'd.routes({...})' },
              { from: '.query()', to: '.read()' },
              { from: '.mutation()', to: '.write()' },
              { from: 'procedure.meta()', to: '.meta()' },
              { from: 'procedure.use()', to: '.middleware()' }
            ]"
            :key="row.from"
            class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 rounded-xl border-2 border-orange-100 bg-linear-to-r from-orange-50/50 to-amber-50/50 hover:border-orange-300 transition-all min-w-0"
          >
            <span
              class="text-slate-500 text-right font-mono text-xs sm:text-sm font-medium truncate"
              >{{ row.from }}</span
            >
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0"
            >
              <Icon name="heroicons:arrow-right" class="text-white text-sm sm:text-lg font-bold" />
            </div>
            <span class="text-slate-900 font-bold font-mono text-xs sm:text-sm truncate">{{
              row.to
            }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA ───────────────────────────────────────────── -->
    <section
      class="py-32 px-4 relative overflow-x-hidden bg-linear-to-br from-orange-600 via-red-600 to-orange-700"
    >
      <!-- Animated background -->
      <div
        class="pointer-events-none absolute inset-0"
        style="
          background: radial-gradient(
            ellipse 80% 60% at 50% 50%,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
        "
      />
      <div
        class="absolute top-10 left-20 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-glow-pulse"
      />
      <div
        class="absolute bottom-10 right-20 w-96 h-96 bg-red-400/20 rounded-full blur-3xl animate-glow-pulse"
        style="animation-delay: 1.5s"
      />

      <div class="relative max-w-4xl mx-auto text-center">
        <div class="inline-block mb-6">
          <span
            class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white/20 text-white backdrop-blur-sm border border-white/30"
          >
            Ready to ship?
          </span>
        </div>
        <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
          Start building in<br />
          under 5 minutes
        </h2>
        <p class="text-orange-100 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Full type safety, Web Standards compatible, zero ceremony.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/docs/introduction"
            class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white text-orange-700 hover:bg-orange-50 transition-all shadow-2xl hover:shadow-white/30 hover:scale-105"
          >
            <Icon name="heroicons:book-open" class="text-lg" />
            Read the docs
            <Icon name="heroicons:arrow-right" class="text-lg" />
          </NuxtLink>
          <NuxtLink
            to="/docs/quick-start"
            class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold border-2 border-white/60 text-white hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            <Icon name="heroicons:play" class="text-lg" />
            Quick Start
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
