(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href$=".html"]');
    if (!link) return;

    const href = link.getAttribute('href');
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!href || href.startsWith('#') || isModified || link.target === '_blank') return;

    const nextUrl = new URL(href, window.location.href);
    if (nextUrl.href === window.location.href) return;

    event.preventDefault();
    document.body.classList.add('page-leave');
    window.setTimeout(() => {
      window.location.href = nextUrl.href;
    }, 170);
  });
})();
