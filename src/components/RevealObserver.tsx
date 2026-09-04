import { useEffect } from 'react';

/**
 * data-reveal を持つ要素が画面に入ったら is-visible を付ける（1回きり）。
 * ルートに1つ置くだけで、後から描画されるカードも MutationObserver で拾う。
 * 見た目は index.css の [data-reveal] が担当。
 */
export default function RevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    const observeAll = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => io.observe(el));
    };
    observeAll(document);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.hasAttribute('data-reveal')) io.observe(node);
          observeAll(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
