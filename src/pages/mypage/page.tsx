import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Product } from '../../types';

interface OrderItemWithProduct {
  id: string;
  quantity: number;
  price_at_purchase: number;
  products: Pick<Product, 'name' | 'images' | 'size' | 'color'> | null;
}

interface Order {
  id: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  order_items: OrderItemWithProduct[];
}

interface FavoriteProduct {
  id: string;
  product_id: string;
  products: Product | null;
}

interface BuybackRequest {
  id: string;
  item_type: string | null;
  item_description: string | null;
  condition: string | null;
  status: 'pending' | 'reviewing' | 'completed' | 'rejected';
  estimated_price: number | null;
  created_at: string;
}

const ORDER_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: '支払い待ち', color: 'bg-gray-100 text-gray-700' },
  paid:      { label: '支払い済み', color: 'bg-blue-100 text-blue-700' },
  shipped:   { label: '発送済み',   color: 'bg-orange-100 text-orange-700' },
  completed: { label: '配送完了',   color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-700' },
};

export default function MyPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites' | 'sell'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // プロフィール編集用ローカルステート
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [instagramAccount, setInstagramAccount] = useState('');
  const [showInstagram, setShowInstagram] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [phone, setPhone] = useState('');

  // 注文・お気に入りデータ
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [buybackRequests, setBuybackRequests] = useState<BuybackRequest[]>([]);
  const [buybackLoading, setBuybackLoading] = useState(false);

  // プロフィールデータをステートに反映
  useEffect(() => {
    if (profile) {
      setPetName(profile.pet_name || '');
      setPetBreed(profile.pet_breed || '');
      setInstagramAccount(profile.instagram_account || '');
      setShowInstagram(profile.show_instagram ?? true);
      setRecipientName(profile.full_name || '');
      setPostalCode(profile.postal_code || '');
      setPrefecture(profile.prefecture || '');
      setCity(profile.city || '');
      setAddress(profile.address || '');
      setBuilding(profile.building || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // 注文履歴取得
  useEffect(() => {
    if (activeTab !== 'orders' || !user) return;
    setOrdersLoading(true);
    supabase
      .from('orders')
      .select('id, status, total_amount, created_at, order_items(id, quantity, price_at_purchase, products(name, images, size, color))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) || []);
        setOrdersLoading(false);
      });
  }, [activeTab, user]);

  // 買取申込履歴取得
  useEffect(() => {
    if (activeTab !== 'sell' || !user) return;
    setBuybackLoading(true);
    supabase
      .from('buyback_requests')
      .select('id, item_type, item_description, condition, status, estimated_price, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBuybackRequests((data as BuybackRequest[]) || []);
        setBuybackLoading(false);
      });
  }, [activeTab, user]);

  // お気に入り取得
  useEffect(() => {
    if (activeTab !== 'favorites' || !user) return;
    setFavoritesLoading(true);
    supabase
      .from('favorites')
      .select('id, product_id, products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFavorites((data as FavoriteProduct[]) || []);
        setFavoritesLoading(false);
      });
  }, [activeTab, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: recipientName,
        phone,
        address,
        pet_name: petName,
        pet_breed: petBreed,
        instagram_account: instagramAccount,
        show_instagram: showInstagram,
        postal_code: postalCode,
        prefecture,
        city,
        building,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setSaveError('保存に失敗しました。もう一度お試しください。');
    } else {
      await refreshProfile();
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    await supabase.from('favorites').delete().eq('id', favoriteId);
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
  };

  const handleAddFavoriteToCart = (fav: FavoriteProduct) => {
    if (!fav.products) return;
    // カートへの追加は CartContext を経由するが、ここでは商品詳細ページへ誘導
    window.location.href = `/products/${fav.product_id}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">マイページ</h1>

          {/* タブナビゲーション */}
          <div className="mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="inline-flex bg-white rounded-full p-1 shadow-sm min-w-max">
              {([
                { key: 'profile',   label: 'プロフィール',    icon: 'ri-user-line' },
                { key: 'orders',    label: '購入履歴',        icon: 'ri-shopping-bag-line' },
                { key: 'favorites', label: 'お気に入り',      icon: 'ri-heart-line' },
                { key: 'sell',      label: '買取申込履歴',    icon: 'ri-price-tag-3-line' },
              ] as const).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === key ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <i className={`${icon} mr-2`}></i>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* プロフィールタブ */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl">
              <div className="bg-white border rounded-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">プロフィール設定</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-edit-line mr-2"></i>編集
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setIsEditing(false); setSaveError(null); }}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {saving ? '保存中...' : '保存'}
                      </button>
                    </div>
                  )}
                </div>

                {saveError && (
                  <p className="mb-4 text-sm text-red-600">{saveError}</p>
                )}

                {/* ペット情報 */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-bold mb-4 text-sm text-gray-700">ペット情報</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">ペットの名前</label>
                      <input
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">犬種</label>
                      <input
                        type="text"
                        value={petBreed}
                        onChange={(e) => setPetBreed(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Instagram連携 */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-bold mb-4 text-sm text-gray-700">Instagram連携</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Instagramアカウント</label>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-500 flex-shrink-0">@</span>
                        <input
                          type="text"
                          value={instagramAccount}
                          onChange={(e) => setInstagramAccount(e.target.value)}
                          disabled={!isEditing}
                          className="flex-1 min-w-0 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                          placeholder="instagram_username"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="ri-instagram-line text-pink-600 flex-shrink-0"></i>
                            <span className="font-medium text-sm">商品ページでの表示</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            ONにすると、あなたが買取に出した商品ページにInstagramアカウントが表示されます。
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm font-medium">{showInstagram ? 'ON' : 'OFF'}</span>
                          <button
                            onClick={() => setShowInstagram(!showInstagram)}
                            disabled={!isEditing}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0 ${
                              showInstagram ? 'bg-gray-900' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                showInstagram ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 配送先住所 */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-bold mb-4 text-sm text-gray-700">配送先住所</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">お名前</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="山田 太郎"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">郵便番号</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">都道府県</label>
                      <input
                        type="text"
                        value={prefecture}
                        onChange={(e) => setPrefecture(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="東京都"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">市区町村</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="渋谷区"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">番地</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="神宮前1-2-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">建物名・部屋番号（任意）</label>
                      <input
                        type="text"
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="〇〇マンション101号室"
                      />
                    </div>
                  </div>
                </div>

                {/* アカウント情報 */}
                <div>
                  <h3 className="font-bold mb-4 text-sm text-gray-700">アカウント情報</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">メールアドレス</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">電話番号</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="090-1234-5678"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 購入履歴タブ */}
          {activeTab === 'orders' && (
            <div>
              {ordersLoading ? (
                <div className="text-center py-16 text-gray-500">読み込み中...</div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = ORDER_STATUS_LABEL[order.status] || ORDER_STATUS_LABEL.pending;
                    const orderDate = new Date(order.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    });
                    return (
                      <div key={order.id} className="bg-white border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              注文番号: {order.id.split('-')[0].toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">注文日: {orderDate}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="space-y-3 mb-4">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                {item.products?.images?.[0] && (
                                  <img
                                    src={item.products.images[0]}
                                    alt={item.products?.name || ''}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium mb-1">{item.products?.name || '商品'}</p>
                                <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                              </div>
                              <p className="font-bold">¥{item.price_at_purchase.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center">
                          <span className="font-bold">合計金額</span>
                          <span className="text-xl font-bold">¥{order.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <i className="ri-shopping-bag-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 mb-6">まだ購入履歴がありません</p>
                  <Link
                    to="/products"
                    className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    商品を見る
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* お気に入りタブ */}
          {activeTab === 'favorites' && (
            <div>
              {favoritesLoading ? (
                <div className="text-center py-16 text-gray-500">読み込み中...</div>
              ) : favorites.length > 0 ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {favorites.map((fav) => {
                    const product = fav.products;
                    if (!product) return null;
                    const imageUrl = product.images?.[0] || '';
                    return (
                      <div key={fav.id} className="group">
                        <div className="relative mb-4 bg-gray-50 rounded-lg overflow-hidden aspect-square">
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <button
                            onClick={() => handleRemoveFavorite(fav.id)}
                            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <i className="ri-heart-fill text-red-500"></i>
                          </button>
                        </div>
                        <h3 className="font-medium mb-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold">¥{product.price.toLocaleString()}</span>
                          {product.original_price && (
                            <span className="text-sm text-gray-400 line-through">
                              ¥{product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddFavoriteToCart(fav)}
                          className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          商品ページへ
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <i className="ri-heart-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 mb-6">お気に入りの商品がありません</p>
                  <Link
                    to="/products"
                    className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    商品を見る
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 買取申込履歴タブ */}
          {activeTab === 'sell' && (
            <div>
              {buybackLoading ? (
                <div className="text-center py-16 text-gray-500">読み込み中...</div>
              ) : buybackRequests.length > 0 ? (
                <div className="space-y-4">
                  {buybackRequests.map((req) => {
                    const statusMap: Record<string, { label: string; color: string }> = {
                      pending:   { label: '未対応',   color: 'bg-gray-100 text-gray-700' },
                      reviewing: { label: '査定中',   color: 'bg-yellow-100 text-yellow-700' },
                      completed: { label: '査定完了', color: 'bg-green-100 text-green-700' },
                      rejected:  { label: '対応不可', color: 'bg-red-100 text-red-700' },
                    };
                    const statusInfo = statusMap[req.status] || statusMap.pending;
                    const date = new Date(req.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    });
                    return (
                      <div key={req.id} className="bg-white border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              申込番号: {req.id.split('-')[0].toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">申込日: {date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">カテゴリー</p>
                            <p className="font-medium">{req.item_type || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">商品の状態</p>
                            <p className="font-medium">{req.condition || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">査定金額</p>
                            <p className="font-bold text-lg">
                              {req.estimated_price != null
                                ? `¥${req.estimated_price.toLocaleString()}`
                                : '査定中'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <i className="ri-price-tag-3-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 mb-6">買取申込履歴がありません</p>
                  <Link
                    to="/buyback"
                    className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    買取申込をする
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
