import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { PRODUCT_SELECT } from '../../../lib/products';
import type { Product } from '../../../types';
import ProductCard from '../../../components/ProductCard';

const LIMIT = 8;

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    supabase.from('products').select(PRODUCT_SELECT).eq('status', 'published')
      .order('created_at', { ascending: false }).limit(LIMIT)
      .then(({ data, error }) => {
        if (!active) return;
        setProducts((data as unknown as Product[]) || []);
        setError(Boolean(error));
        setLoading(false);
      });
    return () => { active = false; };
  }, []);
  return (
    <section id="items" className="shop-container shop-section">
      <div className="shop-section-heading" data-reveal>
        <div><h2>新しく届いた犬服</h2><p>毎週入荷。気になる子はお早めに。</p></div>
        <Link to="/products" className="shop-text-link">すべて見る</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6" role="status" aria-label="商品を読み込んでいます">
          {Array.from({ length: LIMIT }).map((_, i) => <div key={i} className="product-skeleton" />)}
        </div>
      ) : error ? (
        <p className="py-12 text-sm text-slate-600" role="status">商品を読み込めませんでした。<Link to="/products" className="underline">商品一覧へ</Link></p>
      ) : products.length === 0 ? (
        <p className="py-12 text-sm text-slate-600">ただいま次の入荷を準備しています。</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
          {products.map((product, i) => <div key={product.id} data-reveal style={{ '--reveal-delay': `${i * 40}ms` } as React.CSSProperties}><ProductCard product={product} /></div>)}
        </div>
      )}
    </section>
  );
}
