import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import PageMeta from '../../components/PageMeta';
import ProductCard from '../../components/ProductCard';
import { CONDITION_RANKS, CONDITION_INFO, getConditionInfo } from '../../lib/conditions';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart: addToCartContext } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedImage(0);
        setRelatedProducts([]);

        if (!id) throw new Error('Product ID is missing');

        // メイン商品の取得
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .in('status', ['published', 'reserved', 'sold_out']) // draft・hidden はURL直打ちでも見せない
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // 関連商品の取得（同じカテゴリの他の商品、またはランダムに4つ）
        if (productData) {
          let relatedQuery = supabase.from('products').select('*').neq('id', id).eq('status', 'published');
          if (productData.category?.trim()) relatedQuery = relatedQuery.eq('category', productData.category);
          const { data: relatedData } = await relatedQuery.order('created_at', { ascending: false }).limit(4);

          setRelatedProducts(relatedData || []);
        }

      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('商品の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // お気に入り状態をSupabaseから取得
  useEffect(() => {
    setIsFavorite(false);
    setFavoriteId(null);
    if (!user || !id) return;
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setIsFavorite(true);
          setFavoriteId(data.id);
        }
      });
  }, [user, id]);

  const addToCart = () => {
    if (!product) return;

    // 画像URLの取得（安全策）
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';

    addToCartContext({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: product.size,
      color: product.color,
      quantity: 1,
      image: imageUrl,
      seller: null
    });

    // トースト通知を表示
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3000);
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (isFavorite && favoriteId) {
      const { error } = await supabase.from('favorites').delete().eq('id', favoriteId);
      if (error) { alert('お気に入りの解除に失敗しました。'); return; }
      setIsFavorite(false);
      setFavoriteId(null);
    } else if (id) {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: id })
        .select('id')
        .single();
      if (error || !data) { alert('お気に入りの追加に失敗しました。'); return; }
      setIsFavorite(true);
      setFavoriteId(data.id);
    }
  };

  // 割引率計算
  const getDiscountRate = (price: number, originalPrice: number | null): number => {
    if (!originalPrice) return 0;
    return Math.round((1 - price / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex justify-center items-center h-[50vh] pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="text-center py-32 px-4">
          <h2 className="text-2xl font-bold mb-4">商品が見つかりませんでした</h2>
          <p className="text-gray-600 mb-8">{error || '指定された商品は削除されたか、非公開になっています。'}</p>
          <Link to="/products" className="px-6 py-3 bg-black text-white rounded-sm hover:bg-gray-800 transition-colors">
            商品一覧に戻る
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: product.images?.[0] || undefined,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'JPY',
      availability: product.status === 'sold_out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
  } : undefined;

  return (
    <div className="min-h-screen bg-white">
      {product && (
        <PageMeta
          title={product.brand ? `${product.name}【${product.brand}】` : product.name}
          description={product.description || [product.name, product.size?.trim() ? `サイズ ${product.size}` : '', getConditionInfo(product.condition)?.label, 'RePawで犬服をリユース。'].filter(Boolean).join('。')}
          image={product.images?.[0]}
          path={`/product/${product.id}`}
          type="product"
          jsonLd={productJsonLd}
        />
      )}
      <Navigation />

      {/* カート追加トースト */}
      {showAddedToast && (
        <div role="status" className="fixed top-24 right-4 md:right-8 z-50 bg-gray-900 text-white px-4 md:px-6 py-3 md:py-4 rounded-sm shadow-lg flex items-center gap-3 animate-slide-in-right">
          <i className="ri-checkbox-circle-fill text-green-400 text-xl"></i>
          <div>
            <p className="font-medium text-sm md:text-base">カートに追加しました</p>
            <button
              onClick={() => navigate('/cart')}
              className="text-xs md:text-sm text-blue-300 hover:text-blue-200 cursor-pointer mt-1"
            >
              カートを見る →
            </button>
          </div>
        </div>
      )}

      <main className="pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* パンくずリスト */}
          <nav className="mb-6 md:mb-8 text-xs md:text-sm">
            <ol className="flex items-center gap-2 text-gray-600">
              <li><Link to="/" className="hover:text-gray-900 cursor-pointer">ホーム</Link></li>
              <li><i className="ri-arrow-right-s-line"></i></li>
              <li><Link to="/products" className="hover:text-gray-900 cursor-pointer">商品一覧</Link></li>
              <li><i className="ri-arrow-right-s-line"></i></li>
              <li className="text-gray-900 font-medium truncate">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* 画像ギャラリー */}
            <div>
              <div className="mb-3 md:mb-4 bg-gray-50 rounded-sm overflow-hidden aspect-square">
                {product.images && product.images.length > 0 ? (
                  <img
                    key={selectedImage}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain img-fade"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      aria-label={`商品写真 ${index + 1}を表示`}
                      aria-pressed={selectedImage === index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-sm overflow-hidden border-2 transition-all cursor-pointer ${selectedImage === index ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 商品情報 */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">¥{(product.price ?? 0).toLocaleString()}</span>
                  {product.original_price != null && product.original_price > product.price && (
                    <>
                      <span className="text-base md:text-lg text-gray-400 line-through">¥{(product.original_price ?? 0).toLocaleString()}</span>
                      <span className="px-2 md:px-3 py-1 text-stone-600 text-xs md:text-sm font-bold whitespace-nowrap">
                        {getDiscountRate(product.price, product.original_price)}% OFF
                      </span>
                    </>
                  )}
                </div>
                {product.category?.trim() && <p className="text-xs text-stone-600">{product.category}</p>}
              </div>

              {/* 商品詳細情報 */}
              <div className="mb-6 pb-6 border-b">
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                  {product.brand && (
                    <div className="col-span-2">
                      <span className="text-gray-600">ブランド：</span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                  )}
                  {product.size?.trim() && <div><span className="text-gray-600">サイズ：</span><span className="font-medium">{product.size}</span></div>}
                  {getConditionInfo(product.condition) && <div><span className="text-gray-600">状態：</span><span className="font-medium">{getConditionInfo(product.condition)!.label} · {getConditionInfo(product.condition)!.short}</span></div>}
                  {product.color?.trim() && <div><span className="text-gray-600">カラー：</span><span className="font-medium">{product.color}</span></div>}
                </div>
                {(!product.size?.trim() || !getConditionInfo(product.condition)) && <p className="text-xs leading-6 text-stone-600 mt-3">{[!product.size?.trim() ? 'サイズ' : '', !getConditionInfo(product.condition) ? '状態' : ''].filter(Boolean).join('・')}の情報は未登録です。<Link to="/contact" className="underline underline-offset-4">ご購入前にお問い合わせください。</Link></p>}

                {/* 状態ランクの基準。中古品の購入で一番不安な点なので、その場で確認できるようにする */}
                <details className="mt-4 group">
                  <summary className="text-xs md:text-sm text-gray-600 cursor-pointer inline-flex items-center gap-1 hover:text-gray-900 list-none">
                    <i className="ri-information-line"></i>
                    状態ランクの基準
                    <i className="ri-arrow-down-s-line transition-transform group-open:rotate-180"></i>
                  </summary>
                  <dl className="mt-3 space-y-2 text-xs md:text-sm">
                    {CONDITION_RANKS.map((rank) => (
                      <div
                        key={rank}
                        className={`flex gap-3 p-2.5 rounded-sm ${product.condition === rank ? 'bg-stone-100' : 'bg-gray-50'}`}
                      >
                        <dt className="font-bold whitespace-nowrap w-16 shrink-0">{CONDITION_INFO[rank].label}</dt>
                        <dd className="text-gray-700">
                          <span className="font-medium">{CONDITION_INFO[rank].short}</span>
                          <span className="text-gray-500"> — {CONDITION_INFO[rank].description}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </div>

              {/* 実寸サイズ */}
              {(product.back_length_cm || product.chest_cm || product.neck_cm) && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-bold mb-3 text-sm md:text-base">実寸サイズ</h3>
                  <div className="flex gap-6">
                    {product.back_length_cm && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">背丈</p>
                        <p className="font-bold text-lg">{product.back_length_cm}<span className="text-xs font-normal text-gray-500 ml-0.5">cm</span></p>
                      </div>
                    )}
                    {product.chest_cm && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">胴回り</p>
                        <p className="font-bold text-lg">{product.chest_cm}<span className="text-xs font-normal text-gray-500 ml-0.5">cm</span></p>
                      </div>
                    )}
                    {product.neck_cm && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">首回り</p>
                        <p className="font-bold text-lg">{product.neck_cm}<span className="text-xs font-normal text-gray-500 ml-0.5">cm</span></p>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* 商品説明 */}
              {product.description?.trim() && <div className="mb-6 pb-6 border-b">
                <h3 className="font-bold mb-3 text-sm md:text-base">商品説明</h3>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>}

              {/* カート追加（リユース品はすべて一点物） */}
              <div className="mb-6">
                <p className="text-xs md:text-sm text-gray-600 mb-4 flex items-center gap-1.5">
                  この商品は一点物です。売り切れ後の再入荷はありません
                </p>
                <div className="flex gap-3">
                  {product.status === 'sold_out' ? (
                    <div className="flex-1 bg-gray-200 text-gray-500 py-3 md:py-4 rounded-sm text-sm md:text-base font-medium text-center whitespace-nowrap">
                      売り切れ
                    </div>
                  ) : product.status === 'reserved' ? (
                    <div className="flex-1 bg-gray-100 text-gray-500 py-3 md:py-4 rounded-sm text-sm md:text-base font-medium text-center whitespace-nowrap">
                      他のお客様が購入手続き中です
                    </div>
                  ) : (
                  <button
                    onClick={addToCart}
                    className="flex-1 bg-gray-900 text-white py-3 md:py-4 rounded-sm text-sm md:text-base font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    カートに追加
                  </button>
                  )}
                  <button
                    aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                    aria-pressed={isFavorite}
                    onClick={toggleFavorite}
                    className={`px-4 md:px-6 py-3 md:py-4 border rounded-sm transition-colors cursor-pointer ${isFavorite
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <i className={`text-lg md:text-xl ${isFavorite ? 'ri-heart-fill text-red-500' : 'ri-heart-line'
                      }`}></i>
                  </button>
                </div>
              </div>

              {/* 売主Instagram */}
              {product.seller_instagram && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-bold mb-3 text-sm md:text-base flex items-center gap-2">
                    このお洋服の元のオーナー
                  </h3>
                  <a
                    href={`https://www.instagram.com/${product.seller_instagram.trim().replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 border-y border-stone-200 hover:bg-stone-50 transition-colors group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <i className="ri-instagram-line text-stone-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 group-hover:underline transition-colors">
                        @{product.seller_instagram.trim().replace(/^@/, '')}
                      </p>
                      <p className="text-xs text-gray-500">Instagramでプロフィールを見る</p>
                    </div>
                    <i className="ri-external-link-line text-gray-400 ml-auto text-sm"></i>
                  </a>
                </div>
              )}

              {/* 配送情報 */}
              <div className="bg-gray-50 rounded-sm p-3 md:p-4">
                <div className="flex items-start gap-3 mb-3">
                  <i className="ri-truck-line text-lg md:text-xl text-gray-700"></i>
                  <div>
                    <p className="text-xs md:text-sm font-medium mb-1">5,000円以上で送料無料</p>
                    <p className="text-xs text-gray-600">5,000円未満は全国一律500円 / 3〜5営業日でお届け</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* おすすめ商品 */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 md:mt-20">
              <h2 className="text-xl md:text-2xl font-medium mb-6 md:mb-8">
                こちらもおすすめ
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map(item => <ProductCard key={item.id} product={item} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
