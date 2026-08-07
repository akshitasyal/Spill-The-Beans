import { useEffect, useRef } from 'react';

export const useScrollAnimation = (threshold = 0.05) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    // Handle multiple elements — all animate when scrolled into view
    const elements = el.querySelectorAll('.fade-in-up, .fade-in');
    if (elements.length > 0) {
      elements.forEach((child) => {
        observer.observe(child);
      });
    } else {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
};

export const useElementAnimation = (threshold = 0.05) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
};
