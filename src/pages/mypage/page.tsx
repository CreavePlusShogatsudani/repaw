import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Product } from '../../types';
import PageMeta from '../../components/PageMeta';
import { BUYBACK_ITEM_PUBLIC_SELECT, BUYBACK_SHIP_TO, REQUEST_STATUS_USER, ITEM_STATUS_USER, itemDisplayName, requestTotal, type BuybackItem } from '../../lib/buyback';
import { DONATION_RATE } from '../../lib/donation';

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
  status: string;
  payout_method: 'donate' | 'transfer' | null;
  return_preference: 'donate' | 'return_cod';
  created_at: string;
  buyback_items: BuybackItem[];
}

interface Inquiry {
  id: string;
  subject: string;
  body: string;
  status: 'received' | 'auto_sent' | 'pending_approval' | 'approved_sent';
  ai_draft: string | null;
  admin_edited_reply: string | null;
  created_at: string;
  replied_at: string | null;
}

const INQUIRY_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  received:         { label: '確認中',   color: 'bg-[#f3f2ee] text-[#6f6f6a]' },
  pending_approval: { label: '確認中',   color: 'bg-[#f3f2ee] text-[#6f6f6a]' },
  auto_sent:        { label: '回答済み', color: 'bg-[#161616] text-white' },
  approved_sent:    { label: '回答済み', color: 'bg-[#161616] text-white' },
};

const ORDER_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: '支払い待ち', color: 'bg-[#f3f2ee] text-[#6f6f6a]' },
  paid:      { label: '支払い済み', color: 'bg-[#e6e6e1] text-[#2a2a28]' },
  shipped:   { label: '発送済み',   color: 'bg-[#e6e6e1] text-[#2a2a28]' },
  completed: { label: '配送完了',   color: 'bg-[#161616] text-white' },
  cancelled: { label: 'キャンセル', color: 'bg-[#f3f2ee] text-[#6f6f6a] line-through' },
};

export default function MyPage() {
  const { user, profile, refreshProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites' | 'sell' | 'inquiries'>(
    (location.state as any)?.tab || 'profile'
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location.pathname]);
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
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [openInquiryId, setOpenInquiryId] = useState<string | null>(null);

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
      .select(`id, status, payout_method, return_preference, created_at, buyback_items(${BUYBACK_ITEM_PUBLIC_SELECT})`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = ((data as unknown as BuybackRequest[]) || []).map((r) => ({
          ...r,
          buyback_items: [...(r.buyback_items || [])].sort((a, b) => a.sort_order - b.sort_order),
        }));
        setBuybackRequests(rows);
        setBuybackLoading(false);
      });
  }, [activeTab, user]);

  // 問い合わせ履歴取得
  useEffect(() => {
    if (activeTab !== 'inquiries' || !user) return;
    setInquiriesLoading(true);
    supabase
      .from('inquiries')
      .select('id, subject, body, status, ai_draft, admin_edited_reply, created_at, replied_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInquiries((data as Inquiry[]) || []);
        setInquiriesLoading(false);
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

  const donateTotal = buybackRequests
    .filter(r => r.payout_method === 'donate')
    .reduce((sum, r) => sum + requestTotal(r.buyback_items), 0);
  const transferDonation = buybackRequests
    .filter(r => r.payout_method === 'transfer')
    .reduce((sum, r) => sum + Math.floor(requestTotal(r.buyback_items) * DONATION_RATE), 0);
  const donationTotal = donateTotal + transferDonation;

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
    const { error } = await supabase.from('favorites').delete().eq('id', favoriteId);
    if (error) { alert('お気に入りの解除に失敗しました。'); return; }
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
  };

  const handleAddFavoriteToCart = (fav: FavoriteProduct) => {
    if (!fav.products) return;
    // カートへの追加は CartContext を経由するが、ここでは商品詳細ページへ誘導
    navigate(`/product/${fav.product_id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="マイページ" noindex />
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[26px] md:text-[34px] font-medium tracking-[.08em]">マイページ</h1>
            <button
              type="button"
              onClick={async () => { await signOut(); navigate('/'); }}
              className="px-4 py-2 text-sm border rounded-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-logout-box-r-line mr-1"></i>
              ログアウト
            </button>
          </div>

          {/* タブナビゲーション */}
          <div className="mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="rp-tabs min-w-max" role="tablist">
              {([
                { key: 'profile',   label: 'プロフィール',    icon: 'ri-user-line' },
                { key: 'orders',    label: '購入履歴',        icon: 'ri-shopping-bag-line' },
                { key: 'favorites', label: 'お気に入り',      icon: 'ri-heart-line' },
                { key: 'sell',      label: '買取申込履歴',    icon: 'ri-price-tag-3-line' },
                { key: 'inquiries', label: '問い合わせ履歴',  icon: 'ri-question-answer-line' },
              ] as const).map(({ key, label, icon }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className="whitespace-nowrap cursor-pointer"
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
              <div className="bg-white border border-[#e6e6e1] rounded-sm p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">プロフィール設定</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-edit-line mr-2"></i>編集
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setIsEditing(false); setSaveError(null); }}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-4 py-2 text-sm bg-[#161616] text-white rounded-sm hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
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
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">犬種</label>
                      <input
                        type="text"
                        value={petBreed}
                        onChange={(e) => setPetBreed(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
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
                          className="flex-1 min-w-0 px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                          placeholder="instagram_username"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="ri-instagram-line text-[#6f6f6a] flex-shrink-0"></i>
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
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
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
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
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
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
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
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
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
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
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
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
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
                        className="w-full px-4 py-3 border rounded-sm bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">電話番号</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
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
                      <div key={order.id} className="bg-white border border-[#e6e6e1] rounded-sm p-6">
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
                    className="inline-block px-6 py-3 bg-[#161616] text-white rounded-sm hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap"
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
                          <span className="font-bold">¥{(product.price ?? 0).toLocaleString()}</span>
                          {product.original_price && (
                            <span className="text-sm text-gray-400 line-through">
                              ¥{(product.original_price ?? 0).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddFavoriteToCart(fav)}
                          className="w-full py-2 bg-[#161616] text-white rounded-sm hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap"
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
                    className="inline-block px-6 py-3 bg-[#161616] text-white rounded-sm hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap"
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
              {/* 寄付合計 */}
              {!buybackLoading && donationTotal > 0 && (
                <div className="mb-6 p-5 bg-[#f3f2ee] border border-[#e6e6e1] rounded-sm flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#161616] text-white rounded-sm flex-shrink-0">
                    <i className="ri-heart-line text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-0.5">あなたの寄付合計</p>
                    <p className="text-2xl font-bold text-[#161616]">¥{donationTotal.toLocaleString()}</p>
                    <div className="flex gap-3 mt-1">
                      {donateTotal > 0 && (
                        <p className="text-xs text-gray-400">全額寄付 ¥{donateTotal.toLocaleString()}</p>
                      )}
                      {transferDonation > 0 && (
                        <p className="text-xs text-gray-400">振込5% ¥{transferDonation.toLocaleString()}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">保護犬・保護猫の支援に使われています</p>
                  </div>
                </div>
              )}

              {buybackLoading ? (
                <div className="text-center py-16 text-gray-500">読み込み中...</div>
              ) : buybackRequests.length > 0 ? (
                <div className="space-y-6">
                  {buybackRequests.map((req) => {
                    const date = new Date(req.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
                    const showPrices = ['quoted', 'accepted', 'completed', 'returned'].includes(req.status);
                    const total = requestTotal(req.buyback_items);
                    return (
                      <div key={req.id} className="bg-white border border-[#e6e6e1] rounded-sm p-6">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">申込番号: {req.id.split('-')[0].toUpperCase()}</p>
                            <p className="text-sm text-gray-600">申込日: {date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${req.status === 'quoted' ? 'bg-[#161616] text-white' : 'bg-[#f3f2ee] text-[#2a2a28]'}`}>
                            {REQUEST_STATUS_USER[req.status] || REQUEST_STATUS_USER.pending}
                          </span>
                        </div>

                        {/* 服1点ごとの内訳。査定前は「査定中」だけ見せる */}
                        <div className="mt-4 border-t border-[#e6e6e1]">
                          {req.buyback_items.length === 0 ? (
                            <div className="py-4 text-sm text-gray-500">
                              <p>お送りいただいた服が届きしだい、1点ずつ査定します。</p>
                              {req.status === 'pending' && (
                                <p className="mt-2 leading-6">
                                  送り先（着払い）: {BUYBACK_SHIP_TO.postal} {BUYBACK_SHIP_TO.address} {BUYBACK_SHIP_TO.name} TEL {BUYBACK_SHIP_TO.tel}
                                </p>
                              )}
                            </div>
                          ) : req.buyback_items.map((item) => (
                            <div key={item.id} className="grid grid-cols-[64px_1fr_auto] gap-4 py-4 border-b border-[#e6e6e1] items-start">
                              <div className="aspect-[4/5] bg-[#f1f0ec] overflow-hidden">
                                {item.intake_photos?.[0] && <img src={item.intake_photos[0]} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{showPrices ? itemDisplayName(item) : '査定中の服'}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {ITEM_STATUS_USER[item.status] || '査定中'}
                                  {showPrices && item.rank && item.decision === 'buyable' ? ` · ${item.rank}ランク` : ''}
                                </p>
                                {showPrices && item.decision === 'not_buyable' && item.reject_reason && (
                                  <p className="text-xs text-gray-500 mt-1">買取不可：{item.reject_reason}</p>
                                )}
                                {showPrices && item.decision === 'buyable' && item.appraisal_comment && (
                                  <p className="text-xs leading-5 text-gray-600 mt-1">{item.appraisal_comment}</p>
                                )}
                              </div>
                              <p className="text-sm font-medium tabular-nums text-right">
                                {showPrices && item.decision === 'buyable' ? `¥${(item.buyback_price ?? 0).toLocaleString()}` : ''}
                              </p>
                            </div>
                          ))}
                        </div>

                        {showPrices && (
                          <div className="flex justify-between items-baseline pt-4">
                            <p className="text-sm text-gray-600">
                              買取額 合計
                              {req.payout_method === 'donate' && <span className="ml-2 text-xs">全額寄付</span>}
                              {req.payout_method === 'transfer' && <span className="ml-2 text-xs">振込（販売時に{Math.floor(total * DONATION_RATE).toLocaleString()}円を寄付）</span>}
                            </p>
                            <p className="text-lg font-medium tabular-nums">¥{total.toLocaleString()}</p>
                          </div>
                        )}

                        {req.status === 'quoted' && (
                          <div className="mt-4 pt-4 border-t border-[#e6e6e1]">
                            <p className="text-sm text-[#2a2a28] mb-3">査定が完了しました。受け取り方法をお選びください。</p>
                            <Link to={`/buyback/response/${req.id}`} className="inline-block px-6 py-3 bg-[#161616] text-white text-sm font-medium rounded-sm hover:bg-[#333] transition-colors">
                              査定結果を確認して回答する
                            </Link>
                          </div>
                        )}
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
                    className="inline-block px-6 py-3 bg-[#161616] text-white rounded-sm hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    買取申込をする
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 問い合わせ履歴タブ */}
          {activeTab === 'inquiries' && (
            <div>
              {inquiriesLoading ? (
                <div className="text-center py-16 text-gray-500">読み込み中...</div>
              ) : inquiries.length > 0 ? (
                <div className="space-y-4">
                  {inquiries.map((inq) => {
                    const statusInfo = INQUIRY_STATUS_LABEL[inq.status] || INQUIRY_STATUS_LABEL.received;
                    const isReplied = inq.status === 'auto_sent' || inq.status === 'approved_sent';
                    const reply = inq.admin_edited_reply ?? inq.ai_draft;
                    const isOpen = openInquiryId === inq.id;
                    return (
                      <div key={inq.id} className="bg-white border border-[#e6e6e1] rounded-sm p-6">
                        <button
                          type="button"
                          onClick={() => setOpenInquiryId(isOpen ? null : inq.id)}
                          className="w-full flex justify-between items-start gap-4 text-left cursor-pointer"
                        >
                          <div>
                            <p className="font-medium mb-1">{inq.subject}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(inq.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="mt-4 pt-4 border-t space-y-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">お問い合わせ内容</p>
                              <p className="whitespace-pre-wrap">{inq.body}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">回答</p>
                              {isReplied && reply ? (
                                <p className="whitespace-pre-wrap">{reply}</p>
                              ) : (
                                <p className="text-gray-600">確認中です。回答までしばらくお待ちください。</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <i className="ri-question-answer-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 mb-6">問い合わせ履歴がありません</p>
                  <Link
                    to="/contact"
                    className="inline-block px-6 py-3 bg-[#161616] text-white rounded-sm hover:bg-[#333] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    お問い合わせをする
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
