import { Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { useCart } from '../../contexts/CartContext';
import PageMeta from '../../components/PageMeta';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();

  const shippingFee = totalAmount >= 5000 ? 0 : 500;
  const total = totalAmount + shippingFee;

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="カート" noindex />
      <Navigation />

      <main className="pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
            ショッピングカート
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-4 md:mb-6 bg-gray-100 rounded-full">
                <i className="ri-shopping-cart-line text-4xl md:text-5xl text-gray-400"></i>
              </div>
              <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">カートは空です</h2>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">お気に入りの商品を見つけて、カートに追加しましょう</p>
              <Link
                to="/products"
                className="inline-block px-6 md:px-8 py-2.5 md:py-3 bg-gray-900 text-white rounded-lg text-sm md:text-base font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                商品一覧を見る
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
              {/* カート商品リスト */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-4">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <i className="ri-truck-line text-base md:text-lg"></i>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="font-medium">送料無料</span>
                      ) : (
                        <span>
                          あと<span className="font-bold text-orange-600">¥{(5000 - totalAmount).toLocaleString()}</span>で送料無料
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white border rounded-lg p-4 md:p-6">
                      <div className="flex gap-4 md:gap-6">
                        <Link
                          to={`/product/${item.productId}`}
                          className="flex-shrink-0 cursor-pointer"
                        >
                          <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image
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
                              <p className="text-xs md:text-sm text-gray-600 mt-1">
                                {item.seller ? `売主: ${item.seller}` : '出品者'}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer flex-shrink-0"
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
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2.5 md:px-3 py-1.5 md:py-2 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                              >
                                <i className="ri-subtract-line text-sm"></i>
                              </button>
                              <span className="px-3 md:px-4 py-1.5 md:py-2 border-x font-medium whitespace-nowrap min-w-[50px] md:min-w-[60px] text-center text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2.5 md:px-3 py-1.5 md:py-2 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                              >
                                <i className="ri-add-line text-sm"></i>
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-lg md:text-xl font-bold">¥{(item.price * item.quantity).toLocaleString()}</p>
                              <p className="text-xs md:text-sm text-gray-600">¥{item.price.toLocaleString()} × {item.quantity}</p>
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
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-900 text-gray-900 rounded-lg text-sm md:text-base font-medium hover:bg-gray-50 transition-colors text-center cursor-pointer whitespace-nowrap"
                    >
                      買い物を続ける
                    </Link>
                    <Link
                      to="/checkout"
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-orange-600 text-white rounded-lg text-sm md:text-base font-medium hover:bg-orange-700 transition-colors text-center cursor-pointer whitespace-nowrap"
                    >
                      購入手続きへ進む
                    </Link>
                  </div>
                </div>
              </div>

              {/* 注文サマリー */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 md:p-6 sticky top-20 md:top-24">
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

                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t">
                    <p className="text-xs text-gray-600 mb-3">クーポンコードをお持ちですか？</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="クーポンコード"
                        className="flex-1 px-3 md:px-4 py-2 border rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                      <button className="px-3 md:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap">
                        適用
                      </button>
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
