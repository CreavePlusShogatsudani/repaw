import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import PageMeta from '../../components/PageMeta';

export default function CartPage() {
  const { cartItems, removeFromCart, totalAmount, syncWithStock } = useCart();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  // チェックアウト側で外された商品名は state で受け取る
  const [removedNames, setRemovedNames] = useState<string[]>((location.state?.removed as string[] | undefined) ?? []);

  // カートを開いたとき、売り切れ・購入手続き中になった商品を外す
  useEffect(() => {
    if (authLoading) return;
    syncWithStock(user?.id).then(names => { if (names.length > 0) setRemovedNames(prev => [...prev, ...names]); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const shippingFee = totalAmount >= 5000 ? 0 : 500;
  const total = totalAmount + shippingFee;

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="カート" noindex />
      <Navigation />

      <main className="shop-catalog pb-12 md:pb-16">
        <div className="shop-container">
          <h1 className="text-[26px] md:text-[34px] font-medium tracking-[.08em] mb-6 md:mb-8">
            ショッピングカート
          </h1>

          {removedNames.length > 0 && (
            <div className="mb-6 p-4 bg-[#f3f2ee] border border-[#e6e6e1] rounded-sm text-sm text-[#2a2a28]">
              次の商品は売り切れ、または他のお客様が購入手続き中のためカートから外しました：
              <span className="font-medium">{removedNames.join('、')}</span>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">カートは空です</h2>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">お気に入りの商品を見つけて、カートに追加しましょう</p>
              <Link
                to="/products"
                className="inline-block px-6 md:px-8 py-2.5 md:py-3 bg-[#161616] text-white rounded-sm text-sm md:text-base font-medium hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap"
              >
                商品一覧を見る
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
              {/* カート商品リスト */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-sm p-4 md:p-6 mb-4">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <i className="ri-truck-line text-base md:text-lg"></i>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="font-medium">送料無料</span>
                      ) : (
                        <span>
                          あと<span className="font-bold text-stone-700">¥{(5000 - totalAmount).toLocaleString()}</span>で送料無料
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white border-b py-5 md:py-6">
                      <div className="flex gap-4 md:gap-6">
                        <Link
                          to={`/product/${item.productId}`}
                          className="flex-shrink-0 cursor-pointer"
                        >
                          <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-sm overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                写真準備中
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2 md:mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <Link
                                to={`/product/${item.productId}`}
                                className="font-medium text-sm md:text-lg hover:underline cursor-pointer line-clamp-2"
                              >
                                {item.name}
                              </Link>
                              {item.seller?.trim() && item.seller !== '出品者' && <p className="text-xs md:text-sm text-gray-600 mt-1">元のオーナー：{item.seller}</p>}
                            </div>
                            <button
                              aria-label={`${item.name}をカートから削除`}
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer flex-shrink-0 min-w-11 min-h-11 -mt-2 -mr-2"
                            >
                              <i className="ri-close-line text-lg md:text-xl"></i>
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm mb-3 md:mb-4">
                            {item.size && (
                              <div>
                                <span className="text-gray-600">サイズ: </span>
                                <span className="font-medium">{item.size}</span>
                              </div>
                            )}
                            {item.color && (
                              <div>
                                <span className="text-gray-600">カラー: </span>
                                <span className="font-medium">{item.color}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <span className="text-xs text-stone-500">数量 1</span>
                            <div className="text-right">
                              <p className="text-lg md:text-xl font-bold">¥{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <Link
                      to="/products"
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-900 text-gray-900 rounded-sm text-sm md:text-base font-medium hover:bg-gray-50 transition-colors text-center cursor-pointer whitespace-nowrap"
                    >
                      買い物を続ける
                    </Link>
                    <button
                      disabled
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gray-300 text-gray-500 rounded-sm text-sm md:text-base font-medium text-center cursor-not-allowed whitespace-nowrap"
                    >
                      購入手続きへ進む
                    </button>
                  </div>
                  <p className="mt-3 text-xs md:text-sm text-gray-500 text-center sm:text-right">
                    オンライン決済は現在準備中です
                  </p>
                </div>
              </div>

              {/* 注文サマリー */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-sm p-4 md:p-6 sticky top-20 md:top-24">
                  <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">注文サマリー</h2>

                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-600">小計</span>
                      <span className="font-medium">¥{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-600">送料</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-green-600">無料</span>
                        ) : (
                          `¥${shippingFee.toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="pt-3 md:pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm md:text-base font-bold">合計</span>
                        <span className="text-xl md:text-2xl font-bold">¥{total.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-right">税込</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
