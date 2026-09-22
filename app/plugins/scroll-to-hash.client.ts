export default defineNuxtPlugin(() => {
  const router = useRouter();
  const NAV_HEIGHT = 72; // fixed nav (64px) + 8px breathing room

  function scrollToHash(hash: string) {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  router.afterEach(to => {
    if (!to.hash) return;
    // Wait for the new page content to be in the DOM before scrolling
    nextTick(() => {
      const el = document.querySelector(to.hash);
      if (el) {
        scrollToHash(to.hash);
      } else {
        // Content not yet rendered - retry after a short delay
        setTimeout(() => scrollToHash(to.hash), 200);
      }
    });
  });
});
