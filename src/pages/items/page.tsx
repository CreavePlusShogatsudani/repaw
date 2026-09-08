import { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import PageMeta from '../../components/PageMeta';
import { CONDITION_RANKS, CONDITION_INFO } from '../../lib/conditions';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { PRODUCT_CATEGORIES } from '../../lib/productOptions';

const BASE_CATEGORIES = PRODUCT_CATEGORIES;
const SIZES = ['すべて', 'S', 'M', 'L', 'XL', 'フリーサイズ'];
const CONDITIONS = ['すべて', ...CONDITION_RANKS];

const PRICE_RANGES = [
  { label: 'すべて', min: 0, max: Infinity },
  { label: '¥0 - ¥2,000', min: 0, max: 2000 },
  { label: '¥2,000 - ¥3,000', min: 2000, max: 3000 },
  { label: '¥3,000 - ¥4,000', min: 3000, max: 4000 },
  { label: '¥4,000以上', min: 4000, max: Infinity },
];

export default function ItemsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSize = searchParams.get('size') || 'すべて';
  const setSelectedSize = (size: string) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      if (size === 'すべて') next.delete('size');
      else next.set('size', size);
      return next;
    });
  };
  const categories = ['すべて', ...new Set([...BASE_CATEGORIES, ...products.map(p => p.category?.trim()).filter((value): value is string => Boolean(value))])];
  const sizes = [...new Set([...SIZES, ...products.map(p => p.size?.trim()).filter((value): value is string => Boolean(value)), selectedSize])];
  const [selectedCondition, setSelectedCondition] = useState('すべて');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState('新着順');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('status', ['published', 'reserved', 'sold_out']); // draft・hidden は公開しない

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // フィルタリング用ヘルパー
  const matchesFilter = (value: string | null | undefined, filter: string): boolean => {
    if (filter === 'すべて') return true;
    return value === filter;
  };

  // フィルタリング
  let filteredProducts = products.filter(product => {
    if (!matchesFilter(product.category, selectedCategory)) return false;
    if (!matchesFilter(product.size, selectedSize)) return false;
    if (!matchesFilter(product.condition, selectedCondition)) return false;
    if (product.price < selectedPriceRange.min || product.price > selectedPriceRange.max) return false;
    return true;
  });

  // 並び替え: どのソートでも「販売中 → 購入手続き中 → 売り切れ」の順は固定し、その中で並べる
  const STATUS_ORDER: Record<string, number> = { published: 0, reserved: 1, sold_out: 2 };
  const byStatus = (a: Product, b: Product) =>
    (STATUS_ORDER[a.status ?? ''] ?? 9) - (STATUS_ORDER[b.status ?? ''] ?? 9);
  const byNewest = (a: Product, b: Product) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

  let secondary: (a: Product, b: Product) => number = byNewest;
  if (sortBy === '価格が安い順') secondary = (a, b) => a.price - b.price;
  else if (sortBy === '価格が高い順') secondary = (a, b) => b.price - a.price;

  filteredProducts = [...filteredProducts].sort((a, b) => byStatus(a, b) || secondary(a, b));

  const resetFilters = () => {
    setSelectedCategory('すべて');
    setSelectedSize('すべて');
    setSelectedCondition('すべて');
    setSelectedPriceRange(PRICE_RANGES[0]);
  };

  const activeFiltersCount = [
    selectedCategory !== 'すべて',
    selectedSize !== 'すべて',
    selectedCondition !== 'すべて',
    selectedPriceRange.label !== 'すべて'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="アイテム一覧" description="RePawの犬服リユース商品一覧。アウター・ニット・Tシャツなど豊富なラインナップをお手頃価格でご提供。" path="/products" />
      <Navigation />

      <div className="shop-catalog pb-16 md:pb-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="shop-catalog-heading">
            <div><p className="shop-eyebrow">OUR WARDROBE</p><h1>犬服を探す</h1></div>
            {!loading && !error && <p className="text-stone-600 text-xs md:text-sm" role="status">{filteredProducts.length}点</p>}
          </div>
          {selectedSize !== 'すべて' && <div className="mb-6 flex items-center gap-4 text-sm"><span>サイズ：{selectedSize}</span><button type="button" onClick={() => setSelectedSize('すべて')} className="min-h-11 underline underline-offset-4 text-stone-600">解除</button></div>}

          {/* ローディング */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-black"></div>
            </div>
          )}

          {/* エラー */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-black text-white rounded-sm"
              >
                再読み込み
              </button>
            </div>
          )}

          {/* メインコンテンツ */}
          {!loading && !error && (
            <div className="flex gap-6 lg:gap-8">
              {/* サイドバーフィルター（デスクトップ） */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">絞り込み</h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-xs text-gray-500 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                      >
                        クリア ({activeFiltersCount})
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* カテゴリー */}
                    <div>
                      <h4 className="text-sm font-bold mb-3">タイプ</h4>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label key={category} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="category"
                              checked={selectedCategory === category}
                              onChange={() => setSelectedCategory(category)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm group-hover:text-orange-600 transition-colors">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* サイズ */}
                    <div>
                      <h4 className="text-sm font-bold mb-3">サイズ</h4>
                      <div className="space-y-2">
                        {sizes.map((size) => (
                          <label key={size} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="size"
                              checked={selectedSize === size}
                              onChange={() => setSelectedSize(size)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm group-hover:text-orange-600 transition-colors">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 状態 */}
                    <div>
                      <h4 className="text-sm font-bold mb-3">状態</h4>
                      <div className="space-y-2">
                        {CONDITIONS.map((condition) => (
                          <label key={condition} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="condition"
                              checked={selectedCondition === condition}
                              onChange={() => setSelectedCondition(condition)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span
                              className="text-sm group-hover:text-orange-600 transition-colors"
                              title={condition === 'すべて' ? undefined : `${CONDITION_INFO[condition as keyof typeof CONDITION_INFO].short} — ${CONDITION_INFO[condition as keyof typeof CONDITION_INFO].description}`}
                            >
                              {condition === 'すべて' ? condition : `${condition}ランク`}
                              {condition !== 'すべて' && (
                                <span className="ml-1.5 text-xs text-gray-400">{CONDITION_INFO[condition as keyof typeof CONDITION_INFO].short}</span>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 価格帯 */}
                    <div>
                      <h4 className="text-sm font-bold mb-3">価格帯</h4>
                      <div className="space-y-2">
                        {PRICE_RANGES.map((range) => (
                          <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="price"
                              checked={selectedPriceRange.label === range.label}
                              onChange={() => setSelectedPriceRange(range)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm group-hover:text-orange-600 transition-colors">{range.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* メインコンテンツ */}
              <div className="flex-1">
                {/* モバイルフィルターボタン & 並び替え */}
                <div className="flex flex-row justify-between items-stretch sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <button
                    aria-expanded={showFilters}
                    aria-controls="product-filters"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 md:py-2 border border-gray-300 rounded-sm text-sm font-medium hover:border-black transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-filter-3-line"></i>
                    絞り込み
                    {activeFiltersCount > 0 && (
                      <span className="px-2 py-0.5 bg-black text-white text-xs rounded-sm">{activeFiltersCount}</span>
                    )}
                  </button>

                  <div className="relative flex-1 sm:flex-none sm:w-auto">
                    <select
                      aria-label="商品の並び順"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-2 pr-10 border border-gray-300 rounded-sm text-sm font-medium cursor-pointer appearance-none bg-white hover:border-black transition-colors"
                    >
                      <option>新着順</option>
                      <option>価格が安い順</option>
                      <option>価格が高い順</option>
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                  </div>
                </div>

                {/* モバイルフィルターパネル */}
                {showFilters && (
                  <div id="product-filters" className="lg:hidden mb-6 md:mb-8 p-4 md:p-6 bg-gray-50 rounded-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">絞り込み</h3>
                      <div className="flex items-center gap-3">
                        {activeFiltersCount > 0 && (
                          <button
                            onClick={resetFilters}
                            className="text-xs text-gray-500 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                          >
                            クリア ({activeFiltersCount})
                          </button>
                        )}
                        <button
                          aria-label="絞り込みを閉じる"
                          onClick={() => setShowFilters(false)}
                          className="w-6 h-6 flex items-center justify-center cursor-pointer"
                        >
                          <i className="ri-close-line text-xl"></i>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* タイプ */}
                      <div>
                        <h4 className="text-sm font-bold mb-3">タイプ</h4>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedCategory === category
                                  ? 'bg-black text-white'
                                  : 'bg-white border border-gray-300 hover:border-black'
                                }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* サイズ */}
                      <div>
                        <h4 className="text-sm font-bold mb-3">サイズ</h4>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedSize === size
                                  ? 'bg-black text-white'
                                  : 'bg-white border border-gray-300 hover:border-black'
                                }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 状態 */}
                      <div>
                        <h4 className="text-sm font-bold mb-3">状態</h4>
                        <div className="flex flex-wrap gap-2">
                          {CONDITIONS.map((condition) => (
                            <button
                              key={condition}
                              onClick={() => setSelectedCondition(condition)}
                              title={condition === 'すべて' ? undefined : CONDITION_INFO[condition as keyof typeof CONDITION_INFO].short}
                              className={`px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedCondition === condition
                                  ? 'bg-black text-white'
                                  : 'bg-white border border-gray-300 hover:border-black'
                                }`}
                            >
                              {condition === 'すべて' ? condition : `${condition}ランク`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 価格帯 */}
                      <div>
                        <h4 className="text-sm font-bold mb-3">価格帯</h4>
                        <div className="flex flex-wrap gap-2">
                          {PRICE_RANGES.map((range) => (
                            <button
                              key={range.label}
                              onClick={() => setSelectedPriceRange(range)}
                              className={`px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedPriceRange.label === range.label
                                  ? 'bg-black text-white'
                                  : 'bg-white border border-gray-300 hover:border-black'
                                }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 商品グリッド */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 md:py-20">
                    <i className="ri-search-line text-5xl md:text-6xl text-gray-300 mb-4"></i>
                    <p className="text-sm md:text-base text-gray-500 mb-4">
                      {products.length === 0 ? '商品がまだ登録されていません' : '条件に合う商品が見つかりませんでした'}
                    </p>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="mt-4 px-6 py-2 border border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                      >
                        絞り込みをクリア
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" data-product-shop>
                      {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                    </div>

                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
