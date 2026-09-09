import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PRODUCT_SELECT } from '../../../lib/products';
import { PRODUCT_CATEGORIES } from '../../../lib/productOptions';
import type { Product } from '../../../types';
import ProductCard from '../../../components/ProductCard';

// サイズ・種類から探せる入口。新着（8点）の続きをもう4点見せて、トップだけでも商品探しができるようにする
const SIZES = ['S', 'M', 'L', 'XL', 'フリーサイズ'];
const CATEGORY_STYLE: Record<string, { icon: string; className: string }> = {
  'アウター':     { icon: 'ri-t-shirt-air-line', className: 'bg-[#e8f0ff] text-[#1b3f9c]' },
  'トップス':     { icon: 'ri-t-shirt-line',     className: 'bg-[#ffe8da] text-[#d3520f]' },
  'ボトムス':     { icon: 'ri-shirt-line',       className: 'bg-[#fff4bf] text-[#7a5a00]' },
  'アクセサリー': { icon: 'ri-bear-smile-line',  className: 'bg-[#e6f7ee] text-[#1a6b3f]' },
  'その他':       { icon: 'ri-sparkling-line',   className: 'bg-[#f3e9ff] text-[#5b2ea6]' },
};

export default function ExploreSection() {
  const [more, setMore] = useState<Product[]>([]);
  useEffect(() => {
    let active = true;
    supabase.from('products').select(PRODUCT_SELECT).eq('status', 'published')
      .order('created_at', { ascending: false }).range(8, 11)
      .then(({ data }) => { if (active) setMore((data as unknown as Product[]) || []); });
    return () => { active = false; };
  }, []);

  return (
    <section className="shop-container shop-section">
      <div className="shop-section-heading" data-reveal>
        <div><h2>うちの子に合う服を探す</h2><p>サイズ表記はブランドごとに違うので、商品ページの実寸もご確認ください。</p></div>
      </div>
      <div data-reveal>
        <p className="explore-label">サイズから</p>
        <div className="explore-sizes">
          {SIZES.map((size) => <Link key={size} to={`/products?size=${encodeURIComponent(size)}`} aria-label={`${size === 'フリーサイズ' ? size : `${size}サイズ`}の犬服を見る`}>{size === 'フリーサイズ' ? 'フリー' : size}</Link>)}
        </div>
        <p className="explore-label mt-8">種類から</p>
        <div className="explore-categories !mt-0">
          {PRODUCT_CATEGORIES.map((category) => {
            const style = CATEGORY_STYLE[category] ?? CATEGORY_STYLE['その他'];
            return (
              <Link key={category} to={`/products?category=${encodeURIComponent(category)}`} className={style.className}>
                <i className={style.icon} aria-hidden="true"></i>{category}
              </Link>
            );
          })}
        </div>
      </div>
      {more.length > 0 && (
        <div className="mt-14">
          <div className="shop-section-heading" data-reveal>
            <div><h2 className="!text-2xl">まだまだあります</h2></div>
            <Link to="/products" className="shop-text-link">商品一覧へ <i className="ri-arrow-right-line" aria-hidden="true"></i></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
            {more.map((product, i) => <div key={product.id} data-reveal style={{ '--reveal-delay': `${i * 40}ms` } as React.CSSProperties}><ProductCard product={product} /></div>)}
          </div>
        </div>
      )}
    </section>
  );
}
