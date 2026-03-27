<template>
  <div class="min-h-screen flex flex-col bg-[#f8faff]">
    <AppNav />
    <main class="flex-1 pt-16">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
