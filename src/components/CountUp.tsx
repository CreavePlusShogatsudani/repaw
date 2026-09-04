import { useEffect, useRef, useState } from 'react';

/**
 * 画面に入ったら 0 から value までカウントアップする。
 * value が数値として読めない（"--" など）場合はそのまま表示する。
 */
export default function CountUp({ value, duration = 1200, className }: { value: string | number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const str = String(value);
  const numeric = Number(str.replace(/[^\d.]/g, ''));
  const isNumeric = str.trim() !== '' && /\d/.test(str) && Number.isFinite(numeric);
  const prefix = isNumeric ? str.slice(0, str.search(/\d/)) : '';
  const suffix = isNumeric ? str.slice(str.search(/\d/) + str.match(/[\d,.]+/)![0].length) : '';
  const [display, setDisplay] = useState(isNumeric ? 0 : str);

  useEffect(() => {
    if (!isNumeric || !ref.current) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setDisplay(numeric); return; }

    const el = ref.current;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(numeric * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [isNumeric, numeric, duration]);

  return (
    <span ref={ref} className={className}>
      {isNumeric ? `${prefix}${Number(display).toLocaleString()}${suffix}` : display}
    </span>
  );
}
