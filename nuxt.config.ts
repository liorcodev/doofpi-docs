import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/icon', '@nuxt/fonts'],
  ssr: false,
  nitro: {
    preset: 'github_pages'
  },
  app: {
    baseURL: '/doofpi-docs/',
    buildAssetsDir: 'assets',
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },
  fonts: {
    families: [
      { name: 'Inter', weights: [300, 400, 500, 600, 700, 800], styles: ['normal', 'italic'] },
      { name: 'JetBrains Mono', weights: [400, 500] }
    ]
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  css: ['~/assets/css/main.css'],
  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'github-light',
          langs: ['ts', 'typescript', 'js', 'javascript', 'bash', 'json', 'vue', 'html', 'css']
        }
      }
    }
  },
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any]
  }
});
