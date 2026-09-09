import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PRODUCT_SELECT } from '../../../lib/products';
import { PRODUCT_CATEGORIES } from '../../../lib/productOptions';
import type { Product } from '../../../types';
import ProductCard from '../../../components/ProductCard';

// 種類ごとの入口は、アイコンではなく実際の商品写真をタイルにする。
// 商品が無い種類は出さない。サイズはテキストのリンク。
const SIZES = ['S', 'M', 'L', 'XL', 'フリーサイズ'];

export default function ExploreSection() {
  const [tiles, setTiles] = useState<{ category: string; image: string }[]>([]);
  const [more, setMore] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: tileRows }, { data: moreRows }] = await Promise.all([
        supabase.from('products').select('category, images').eq('status', 'published').not('images', 'is', null).order('created_at', { ascending: false }).limit(60),
        supabase.from('products').select(PRODUCT_SELECT).eq('status', 'published').order('created_at', { ascending: false }).range(8, 11),
      ]);
      if (!active) return;
      const byCategory = new Map<string, string>();
      for (const row of (tileRows as { category: string | null; images: string[] | null }[]) || []) {
        const category = row.category?.trim();
        const image = row.images?.[0];
        if (category && image && !byCategory.has(category)) byCategory.set(category, image);
      }
      setTiles(PRODUCT_CATEGORIES.filter((c) => byCategory.has(c)).map((c) => ({ category: c, image: byCategory.get(c)! })));
      setMore((moreRows as unknown as Product[]) || []);
    })();
    return () => { active = false; };
  }, []);

  return (
    <section className="shop-container shop-section">
      <div className="shop-section-heading" data-reveal>
        <div><h2>うちの子に合う服を探す</h2><p>サイズ表記はブランドごとに違います。商品ページの実寸もご確認ください。</p></div>
      </div>
      <div data-reveal>
        <p className="explore-label">サイズから</p>
        <div className="explore-sizes">
          {SIZES.map((size) => <Link key={size} to={`/products?size=${encodeURIComponent(size)}`} aria-label={`${size === 'フリーサイズ' ? size : `${size}サイズ`}の犬服を見る`}>{size === 'フリーサイズ' ? 'フリー' : size}</Link>)}
        </div>
        {tiles.length > 0 && (
          <>
            <p className="explore-label mt-10">種類から</p>
            <div className="explore-categories">
              {tiles.map(({ category, image }) => (
                <Link key={category} to={`/products?category=${encodeURIComponent(category)}`}>
                  <div className="tile"><img src={image} alt="" loading="lazy" /></div>
                  <p>{category}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      {more.length > 0 && (
        <div className="mt-16">
          <div className="shop-section-heading" data-reveal>
            <div><h2>まだまだあります</h2></div>
            <Link to="/products" className="shop-text-link">商品一覧へ</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {more.map((product, i) => <div key={product.id} data-reveal style={{ '--reveal-delay': `${i * 40}ms` } as React.CSSProperties}><ProductCard product={product} /></div>)}
          </div>
        </div>
      )}
    </section>
  );
}
