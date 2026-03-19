import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import PageMeta from '../../components/PageMeta';

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
  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error('Product ID is missing');

        // メイン商品の取得
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // 関連商品の取得（同じカテゴリの他の商品、またはランダムに4つ）
        if (productData) {
          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .neq('id', id) // 自分自身は除外
            .limit(4);

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
      quantity: quantity,
      image: imageUrl,
      seller: '出品者' // 将来的には実際の出品者名
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
      await supabase.from('favorites').delete().eq('id', favoriteId);
      setIsFavorite(false);
      setFavoriteId(null);
    } else if (id) {
      const { data } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: id })
        .select('id')
        .single();
      if (data) {
        setIsFavorite(true);
        setFavoriteId(data.id);
      }
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
          <Link to="/products" className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
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
          title={product.name}
          description={product.description || `${product.name} - サイズ: ${product.size}、状態: ${product.condition}。RePawで犬服をリユース。`}
          image={product.images?.[0]}
          path={`/product/${product.id}`}
          type="product"
          jsonLd={productJsonLd}
        />
      )}
      <Navigation />

      {/* カート追加トースト */}
      {showAddedToast && (
        <div className="fixed top-24 right-4 md:right-8 z-50 bg-gray-900 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right">
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
              <div className="mb-3 md:mb-4 bg-gray-50 rounded-lg overflow-hidden aspect-square">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
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
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selectedImage === index ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
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
                  {product.original_price && (
                    <>
                      <span className="text-base md:text-lg text-gray-400 line-through">¥{(product.original_price ?? 0).toLocaleString()}</span>
                      <span className="px-2 md:px-3 py-1 bg-red-100 text-red-600 text-xs md:text-sm font-bold rounded-full whitespace-nowrap">
                        {getDiscountRate(product.price, product.original_price)}% OFF
                      </span>
                    </>
                  )}
                </div>
                {/* タグはDBにないので、カテゴリや状態を表示 */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 md:px-3 py-1 bg-gray-100 text-gray-700 text-xs md:text-sm rounded-full whitespace-nowrap">
                    #{product.category}
                  </span>
                  <span className="px-2.5 md:px-3 py-1 bg-gray-100 text-gray-700 text-xs md:text-sm rounded-full whitespace-nowrap">
                    #{product.condition}ランク
                  </span>
                </div>
              </div>

              {/* 商品詳細情報 */}
              <div className="mb-6 pb-6 border-b">
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                  <div>
                    <span className="text-gray-600">サイズ：</span>
                    <span className="font-medium">{product.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">状態：</span>
                    <span className="font-medium">{product.condition}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">カラー：</span>
                    <span className="font-medium">{product.color}</span>
                  </div>
                  {/* ブランドと素材はDBスキーマにないので一旦削除、必要なら追加 */}
                </div>
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

              {/* サイズ表 */}
              {product.size_chart && product.size_chart.length > 0 && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-bold mb-3 text-sm md:text-base">サイズ表</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600">サイズ</th>
                          <th className="border border-gray-200 px-3 py-2 text-center font-medium text-gray-600">背丈<span className="text-gray-400 font-normal">(cm)</span></th>
                          <th className="border border-gray-200 px-3 py-2 text-center font-medium text-gray-600">胸回り<span className="text-gray-400 font-normal">(cm)</span></th>
                          <th className="border border-gray-200 px-3 py-2 text-center font-medium text-gray-600">首回り<span className="text-gray-400 font-normal">(cm)</span></th>
                          <th className="border border-gray-200 px-3 py-2 text-center font-medium text-gray-600">体重目安</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.size_chart.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-200 px-3 py-2 font-medium">{row.size}</td>
                            <td className="border border-gray-200 px-3 py-2 text-center">{row.back_length}</td>
                            <td className="border border-gray-200 px-3 py-2 text-center">{row.chest}</td>
                            <td className="border border-gray-200 px-3 py-2 text-center">{row.neck}</td>
                            <td className="border border-gray-200 px-3 py-2 text-center">{row.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">※ サイズは目安です。個体差がある場合があります。</p>
                </div>
              )}

              {/* 商品説明 */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-bold mb-3 text-sm md:text-base">商品説明</h3>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* 数量選択とカート追加 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                  <span className="text-sm font-medium whitespace-nowrap">数量：</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 md:px-4 py-2 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-subtract-line text-sm md:text-base"></i>
                    </button>
                    <span className="px-4 md:px-6 py-2 border-x font-medium whitespace-nowrap text-sm md:text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 md:px-4 py-2 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-add-line text-sm md:text-base"></i>
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  {product.status === 'sold_out' ? (
                    <div className="flex-1 bg-gray-200 text-gray-500 py-3 md:py-4 rounded-lg text-sm md:text-base font-medium text-center whitespace-nowrap">
                      売り切れ
                    </div>
                  ) : (
                  <button
                    onClick={addToCart}
                    className="flex-1 bg-gray-900 text-white py-3 md:py-4 rounded-lg text-sm md:text-base font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    カートに追加
                  </button>
                  )}
                  <button
                    onClick={toggleFavorite}
                    className={`px-4 md:px-6 py-3 md:py-4 border rounded-lg transition-colors cursor-pointer ${isFavorite
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
                    <i className="ri-instagram-line text-pink-500"></i>
                    このお洋服の元のオーナー
                  </h3>
                  <a
                    href={`https://www.instagram.com/${product.seller_instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-xl hover:from-pink-100 hover:to-purple-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-instagram-line text-white text-xl"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-pink-600 transition-colors">
                        @{product.seller_instagram}
                      </p>
                      <p className="text-xs text-gray-500">Instagramでプロフィールを見る</p>
                    </div>
                    <i className="ri-external-link-line text-gray-400 ml-auto text-sm"></i>
                  </a>
                </div>
              )}

              {/* 配送情報 */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <div className="flex items-start gap-3 mb-3">
                  <i className="ri-truck-line text-lg md:text-xl text-gray-700"></i>
                  <div>
                    <p className="text-xs md:text-sm font-medium mb-1">送料無料</p>
                    <p className="text-xs text-gray-600">3〜5営業日でお届け</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-arrow-go-back-line text-lg md:text-xl text-gray-700"></i>
                  <div>
                    <p className="text-xs md:text-sm font-medium mb-1">30日間返品保証</p>
                    <p className="text-xs text-gray-600">商品到着後30日以内なら返品可能</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* おすすめ商品 */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 md:mt-20">
              <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center">
                こちらもおすすめ
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="mb-3 md:mb-4 bg-gray-50 rounded-lg overflow-hidden aspect-square">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 line-clamp-1">{item.name}</h3>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className="text-sm md:text-base font-bold">¥{item.price.toLocaleString()}</span>
                      {item.original_price && (
                        <span className="text-xs md:text-sm text-gray-400 line-through">¥{item.original_price.toLocaleString()}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
