import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Product } from '../../../types';

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .neq('status', 'hidden')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setProducts(data || []));
  }, []);

  const getDiscountRate = (price: number, originalPrice: number | null) => {
    if (!originalPrice) return null;
    return Math.round((1 - price / originalPrice) * 100);
  };

  return (
    <section className="py-24 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>New Arrivals</h2>
          <p className="text-sm md:text-base text-gray-600">Check out the latest reused dog clothing</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">商品がありません</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const imageUrl = product.images?.[0] || '';
              const discountRate = getDiscountRate(product.price, product.original_price);
              return (
                <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer">
                  <div className="relative mb-3 bg-gray-50 rounded-lg overflow-hidden">
                    <div className="w-full h-64 md:h-80">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                      <i className="ri-heart-line text-base md:text-lg"></i>
                    </button>
                    {discountRate && (
                      <div className="absolute top-3 left-3 px-2 md:px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full whitespace-nowrap">
                        {discountRate}% OFF
                      </div>
                    )}
                  </div>
                  <div>
                    {product.size && (
                      <p className="text-xs text-gray-500 mb-1">サイズ: {product.size}</p>
                    )}
                    <h3 className="text-xs md:text-sm font-medium mb-2 group-hover:underline">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-base md:text-lg font-bold">¥{(product.price ?? 0).toLocaleString()}</span>
                      {product.original_price && (
                        <span className="text-xs md:text-sm text-gray-400 line-through">¥{(product.original_price ?? 0).toLocaleString()}</span>
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
            <button className="px-6 md:px-8 py-2.5 md:py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer rounded-lg">
              新着商品をもっと見る
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
