<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppNav />
    <div class="flex flex-1 pt-16">
      <!-- Sidebar -->
      <DocsSidebar />
      <!-- Main content -->
      <main class="flex-1 min-w-0 px-6 py-10 lg:pl-72 lg:pr-60">
        <div class="max-w-3xl mx-auto">
          <slot />
          <DocsNavigation class="mt-16" />
        </div>
      </main>
      <!-- Right TOC -->
      <DocsToc />
    </div>
  </div>
</template>
