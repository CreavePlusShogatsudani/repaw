import { Link } from 'react-router-dom';

export default function SizeSection() {
  return (
    <section className="shop-container shop-size-section">
      <div><h2 className="text-lg font-medium">うちの子のサイズから</h2><p className="mt-2 text-xs leading-relaxed text-stone-600">サイズ表記はブランドごとに異なります。<br className="hidden md:block" />商品詳細の実寸もご確認ください。</p></div>
      <div className="shop-size-links">
        {['S', 'M', 'L', 'XL', 'フリーサイズ'].map(size => <Link key={size} to={`/products?size=${encodeURIComponent(size)}`} aria-label={`${size}サイズの犬服を見る`}>{size}<span aria-hidden="true">↗</span></Link>)}
      </div>
    </section>
  );
}
