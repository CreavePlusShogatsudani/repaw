import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';

const CATEGORIES = ['すべて', 'アウター', 'ニット', 'Tシャツ', 'アクセサリー'];
const SIZES = ['すべて', 'S', 'M', 'L', 'XL', 'フリー'];
const CONDITIONS = ['すべて', 'A', 'B', 'C'];

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
  const [selectedSize, setSelectedSize] = useState('すべて');
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
          .neq('status', 'hidden'); // 非公開以外を取得

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

  // 並び替え
  if (sortBy === '価格が安い順') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === '価格が高い順') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === '新着順') {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

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

  // 商品画像URL取得
  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://placehold.co/400x500?text=No+Image';
  };

  // 割引率計算
  const getDiscountRate = (price: number, originalPrice: number | null): number => {
    if (!originalPrice) return 0;
    return Math.round((1 - price / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>All Items</h1>
            <p className="text-gray-600 text-xs md:text-sm tracking-wider">全{filteredProducts.length}点の商品</p>
          </div>

          {/* ローディング */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          )}

          {/* エラー */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-black text-white rounded-lg"
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
                        {CATEGORIES.map((category) => (
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
                        {SIZES.map((size) => (
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
                            <span className="text-sm group-hover:text-orange-600 transition-colors">
                              {condition === 'すべて' ? condition : `${condition}ランク`}
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
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-black transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-filter-3-line"></i>
                    絞り込み
                    {activeFiltersCount > 0 && (
                      <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">{activeFiltersCount}</span>
                    )}
                  </button>

                  <div className="relative w-full sm:w-auto">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-2 pr-10 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer appearance-none bg-white hover:border-black transition-colors"
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
                  <div className="lg:hidden mb-6 md:mb-8 p-4 md:p-6 bg-gray-50 rounded-lg">
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
                          {CATEGORIES.map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedCategory === category
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
                          {SIZES.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedSize === size
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
                              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedCondition === condition
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
                              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${selectedPriceRange.label === range.label
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
                      {filteredProducts.map((product) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer">
                          <div className="relative mb-3 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-full h-64 md:h-80">
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            {product.status === 'sold_out' && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="px-4 md:px-6 py-2 md:py-3 bg-white text-black text-xs md:text-sm font-bold rounded-lg">SOLD OUT</span>
                              </div>
                            )}
                            {product.status !== 'sold_out' && (
                              <>
                                <button className="absolute top-2 md:top-3 right-2 md:right-3 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                                  <i className="ri-heart-line text-base md:text-lg"></i>
                                </button>
                                {product.original_price && (
                                  <div className="absolute top-2 md:top-3 left-2 md:left-3 px-2 md:px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full whitespace-nowrap">
                                    {getDiscountRate(product.price, product.original_price)}% OFF
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                              {/* 出品者情報は未実装のため一時的にダミー表示 */}
                              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full overflow-hidden bg-gray-100">
                                <i className="ri-user-line text-gray-400"></i>
                              </div>
                              <span className="text-xs text-gray-500">
                                出品者
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500">サイズ: {product.size}</span>
                              <span className="text-xs text-gray-500">{product.condition}ランク</span>
                            </div>
                            <h3 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 group-hover:underline line-clamp-1">{product.name}</h3>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <span className="text-base md:text-lg font-bold">¥{(product.price ?? 0).toLocaleString()}</span>
                              {product.original_price && (
                                <span className="text-xs md:text-sm text-gray-400 line-through">¥{(product.original_price ?? 0).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* ページネーション（将来の実装用） */}
                    {filteredProducts.length >= 12 && (
                      <div className="mt-12 md:mt-16 flex justify-center">
                        <div className="flex items-center gap-2">
                          <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:border-black transition-colors cursor-pointer">
                            <i className="ri-arrow-left-s-line text-lg md:text-xl"></i>
                          </button>
                          <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black text-white rounded-lg cursor-pointer text-sm">
                            1
                          </button>
                          <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:border-black transition-colors cursor-pointer">
                            <i className="ri-arrow-right-s-line text-lg md:text-xl"></i>
                          </button>
                        </div>
                      </div>
                    )}
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
