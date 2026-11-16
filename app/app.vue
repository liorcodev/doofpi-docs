<template>
  <NuxtLoadingIndicator
    :height="3"
    color="linear-gradient(to right, var(--color-brand-300), var(--color-brand-500), var(--color-brand-700))"
  />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
