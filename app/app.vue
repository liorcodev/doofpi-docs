<template>
  <NuxtLoadingIndicator
    :height="3"
    color="linear-gradient(to right, var(--color-primary-lighter), var(--color-primary), var(--color-primary-darker))"
  />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
