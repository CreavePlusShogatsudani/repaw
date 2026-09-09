import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PRODUCT_CATEGORIES } from '../../../lib/productOptions';

// 種類ごとの入口は、アイコンではなく実際の商品写真をタイルにする。
// 商品が無い種類は出さない。サイズはテキストのリンク。
const SIZES = ['S', 'M', 'L', 'XL', 'フリーサイズ'];

export default function ExploreSection() {
  const [tiles, setTiles] = useState<{ category: string; image: string }[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: tileRows } = await supabase.from('products').select('category, images').eq('status', 'published').not('images', 'is', null).order('created_at', { ascending: false }).limit(60);
      if (!active) return;
      const byCategory = new Map<string, string>();
      for (const row of (tileRows as { category: string | null; images: string[] | null }[]) || []) {
        const category = row.category?.trim();
        const image = row.images?.[0];
        if (category && image && !byCategory.has(category)) byCategory.set(category, image);
      }
      setTiles(PRODUCT_CATEGORIES.filter((c) => byCategory.has(c)).map((c) => ({ category: c, image: byCategory.get(c)! })));
    })();
    return () => { active = false; };
  }, []);

  return (
    <section className="shop-container shop-section">
      <div className="shop-section-heading" data-reveal>
        <div><p className="shop-eyebrow">Find yours</p><h2>うちの子に合う服を探す</h2><p>サイズ表記はブランドごとに違います。商品ページの実寸もご確認ください。</p></div>
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
    </section>
  );
}
