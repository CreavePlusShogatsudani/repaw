import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  products: {
    id: string;
    name: string;
    images: string[] | null;
    size: string | null;
    color: string | null;
  } | null;
}

interface Order {
  id: string;
  total_amount: number;
  shipping_address: {
    email?: string;
    lastName?: string;
    firstName?: string;
    postalCode?: string;
    prefecture?: string;
    city?: string;
    address?: string;
    building?: string;
    phone?: string;
  };
  created_at: string;
}

export default function OrderCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId as string | undefined;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!orderId) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        navigate('/');
        return;
      }

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('id, quantity, price_at_purchase, products(id, name, images, size, color)')
        .eq('order_id', orderId);

      setOrder(orderData);
      setOrderItems((itemsData as OrderItem[]) || []);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-[50vh] pt-20">
          <div className="text-gray-500">読み込み中...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const shippingAddress = order.shipping_address || {};
  const orderDate = new Date(order.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const estimatedDelivery = new Date(
    new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const orderNumber = order.id.split('-')[0].toUpperCase();
  const email = shippingAddress.email || '';
  const recipientName = `${shippingAddress.lastName || ''} ${shippingAddress.firstName || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* 成功メッセージ */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
              <i className="ri-check-line text-5xl text-green-600"></i>
            </div>
            <h1 className="text-3xl font-bold mb-4">ご注文ありがとうございます！</h1>
            <p className="text-gray-600 text-lg">
              ご注文が正常に完了しました。確認メールを
              <span className="font-medium">{email}</span>に送信しました。
            </p>
          </div>

          {/* 注文番号と日付 */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-2">注文番号</p>
                <p className="font-bold text-lg">{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">注文日</p>
                <p className="font-medium">{orderDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">お届け予定日</p>
                <p className="font-medium text-orange-600">{estimatedDelivery}</p>
              </div>
            </div>
          </div>

          {/* 注文内容 */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-6">注文内容</h2>
            <div className="space-y-4 mb-6 pb-6 border-b">
              {orderItems.map((item) => {
                const imageUrl = item.products?.images?.[0] || '';
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={item.products?.name || ''}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-2">{item.products?.name || '商品'}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.products?.size} / {item.products?.color}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">数量: {item.quantity}</span>
                        <span className="font-bold">
                          ¥{(item.price_at_purchase * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">合計金額</span>
              <span className="text-2xl font-bold">¥{order.total_amount.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 text-right mt-1">税込・送料込</p>
          </div>

          {/* 配送先情報 */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-6">配送先</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-base">{recipientName}</p>
              <p className="text-gray-700">〒{shippingAddress.postalCode}</p>
              <p className="text-gray-700">
                {shippingAddress.prefecture}{shippingAddress.city}{shippingAddress.address}
              </p>
              {shippingAddress.building && (
                <p className="text-gray-700">{shippingAddress.building}</p>
              )}
              <p className="text-gray-700">電話: {shippingAddress.phone}</p>
            </div>
          </div>

          {/* 次のステップ */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <i className="ri-information-line text-xl text-orange-600"></i>
              <span>次のステップ</span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <i className="ri-mail-line text-lg text-orange-600 flex-shrink-0 mt-0.5"></i>
                <span>注文確認メールをご確認ください（迷惑メールフォルダもご確認ください）</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-box-3-line text-lg text-orange-600 flex-shrink-0 mt-0.5"></i>
                <span>商品の準備が整い次第、発送完了メールをお送りします</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-truck-line text-lg text-orange-600 flex-shrink-0 mt-0.5"></i>
                <span>配送状況はマイページの注文履歴から確認できます</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-customer-service-2-line text-lg text-orange-600 flex-shrink-0 mt-0.5"></i>
                <span>ご不明な点がございましたら、お気軽にお問い合わせください</span>
              </li>
            </ul>
          </div>

          {/* アクションボタン */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/mypage"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-user-line text-xl"></i>
              <span>マイページで確認</span>
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-shopping-bag-line text-xl"></i>
              <span>買い物を続ける</span>
            </Link>
          </div>

          {/* サポート情報 */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">お困りのことがございましたら</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-question-line text-lg"></i>
                <span>よくある質問</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-mail-line text-lg"></i>
                <span>お問い合わせ</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-phone-line text-lg"></i>
                <span>電話サポート</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
