import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Product } from '../../../types';
import ProductCard from '../../../components/ProductCard';

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    supabase.from('products').select('*').eq('status', 'published')
      .order('created_at', { ascending: false }).limit(4)
      .then(({ data, error }) => {
        if (!active) return;
        setProducts(data || []);
        setError(Boolean(error));
        setLoading(false);
      });
    return () => { active = false; };
  }, []);
  return (
    <section id="items" className="shop-container shop-section">
      <div className="shop-section-heading">
        <div><p className="shop-eyebrow">NEW ARRIVALS</p><h2>新しく届いた犬服</h2></div>
        <Link to="/products" className="shop-text-link">すべて見る <span aria-hidden="true">→</span></Link>
      </div>
      {loading ? <p className="py-12 text-sm text-stone-500" role="status">商品を読み込んでいます</p>
        : error ? <p className="py-12 text-sm text-stone-600" role="status">商品を読み込めませんでした。<Link to="/products" className="underline">商品一覧へ</Link></p>
        : products.length === 0 ? <p className="py-12 text-sm text-stone-600">ただいま次の入荷を準備しています。</p>
        : <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-7">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>}
    </section>
  );
}
