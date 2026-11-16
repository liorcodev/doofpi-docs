export default defineNuxtPlugin(() => {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  const scan = () => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => observer.observe(el));
  };

  useNuxtApp().hook('page:finish', () => nextTick(scan));
});
