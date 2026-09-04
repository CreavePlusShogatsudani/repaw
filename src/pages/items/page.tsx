import { useState, useEffect, type CSSProperties } from 'react';
import PageMeta from '../../components/PageMeta';
import { CONDITION_RANKS, CONDITION_INFO, getConditionInfo } from '../../lib/conditions';
import { Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';

const CATEGORIES = ['すべて', 'アウター', 'ニット', 'Tシャツ', 'アクセサリー'];
const SIZES = ['すべて', 'S', 'M', 'L', 'XL', 'フリー'];
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
    (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
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
      <PageMeta title="アイテム一覧" description="RePawの犬服リユース商品一覧。アウター・ニット・Tシャツなど豊富なラインナップをお手頃価格でご提供。" path="/products" />
      <Navigation />

      <div className="pt-20 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>All Items</h1>
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
                              title={condition === 'すべて' ? undefined : CONDITION_INFO[condition as keyof typeof CONDITION_INFO].short}
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
                      {filteredProducts.map((product, index) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="group cursor-pointer"
                          data-reveal
                          style={{ '--reveal-delay': `${(index % 12) * 50}ms` } as CSSProperties}
                        >
                          <div className="relative mb-3 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-full h-64 md:h-80 relative">
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className={`w-full h-full object-cover object-top transition-transform duration-500 ${product.status === 'sold_out' ? 'grayscale' : 'group-hover:scale-105'}`}
                              />
                              {/* 2枚目の写真があれば hover でクロスフェード */}
                              {product.images?.[1] && product.status !== 'sold_out' && (
                                <img
                                  src={product.images[1]}
                                  alt=""
                                  aria-hidden="true"
                                  className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                />
                              )}
                              {/* hover で状態と実寸をそっと出す（PCのみ） */}
                              {product.status === 'published' && (
                                <div className="hidden md:flex absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent text-white text-[11px] gap-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                                  {getConditionInfo(product.condition) && <span>{product.condition}ランク · {getConditionInfo(product.condition)!.short}</span>}
                                  {product.back_length_cm && <span>背丈 {product.back_length_cm}cm</span>}
                                  {product.chest_cm && <span>胴回り {product.chest_cm}cm</span>}
                                </div>
                              )}
                            </div>
                            {product.status === 'sold_out' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="px-4 md:px-6 py-2 md:py-3 bg-white text-black text-xs md:text-sm font-bold rounded-lg -rotate-6 shadow">SOLD OUT</span>
                              </div>
                            )}
                            {product.status === 'reserved' && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="px-4 md:px-6 py-2 md:py-3 bg-white text-gray-700 text-xs md:text-sm font-bold rounded-lg pulse-soft">購入手続き中</span>
                              </div>
                            )}
                            {product.status !== 'sold_out' && product.status !== 'reserved' && (
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
                              {/* リユース品はすべて一点物。出品者表示は買取オン後に再検討 */}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-[11px] md:text-xs font-medium rounded-full whitespace-nowrap">
                                <i className="ri-sparkling-line"></i>一点物
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500">サイズ: {product.size}</span>
                              <span className="text-xs text-gray-500" title={getConditionInfo(product.condition)?.description}>
                                {product.condition}ランク
                                {getConditionInfo(product.condition) && (
                                  <span className="text-gray-400"> · {getConditionInfo(product.condition)!.short}</span>
                                )}
                              </span>
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
