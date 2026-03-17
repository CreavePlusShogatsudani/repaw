import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Product } from '../../../types';

const CATEGORIES = ['アウター', 'ニット', 'Tシャツ', 'アクセサリー'];

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .neq('status', 'hidden')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => setProducts(data || []));
  }, []);

  const filtered = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const getDiscountRate = (price: number, originalPrice: number | null) => {
    if (!originalPrice) return null;
    return Math.round((1 - price / originalPrice) * 100);
  };

  return (
    <section id="items" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Items</h2>
          <p className="text-gray-600 text-sm tracking-wider">商品一覧</p>
        </div>

        <div className="flex mb-12 overflow-x-auto scrollbar-hide -mx-6 px-6">
          <div className="inline-flex bg-white rounded-full p-1 shadow-sm min-w-max">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedCategory === 'all' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              すべて
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedCategory === cat ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">商品がありません</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const imageUrl = product.images?.[0] || '';
              const discountRate = getDiscountRate(product.price, product.original_price);
              return (
                <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer">
                  <div className="relative mb-3 bg-white rounded-lg overflow-hidden">
                    <div className="w-full h-80 bg-gray-50">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                      <i className="ri-heart-line text-lg"></i>
                    </button>
                    {discountRate && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full whitespace-nowrap">
                        {discountRate}% OFF
                      </div>
                    )}
                  </div>
                  <div>
                    {product.size && (
                      <p className="text-xs text-gray-500 mb-1">サイズ: {product.size}</p>
                    )}
                    <h3 className="text-sm font-medium mb-2 group-hover:underline">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">¥{product.price.toLocaleString()}</span>
                      {product.original_price && (
                        <span className="text-sm text-gray-400 line-through">¥{product.original_price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/products">
            <button className="px-8 py-3 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap cursor-pointer">
              すべての商品を見る
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
