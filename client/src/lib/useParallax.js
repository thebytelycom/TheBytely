import { useEffect } from 'react';

// Moves every element with a data-depth attribute by a small amount as the
// page scrolls. Deeper values move more, which creates the parallax effect.
export function useParallax(routeKey) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let ticking = false;
    const run = () => {
      const vh = window.innerHeight;
      document.querySelectorAll('[data-depth]').forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        const depth = parseFloat(el.dataset.depth);
        const offset = (r.top + r.height / 2 - vh / 2) * -depth;
        el.style.setProperty('--py', `${offset.toFixed(1)}px`);
      });
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    };
    run();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [routeKey]);
}
