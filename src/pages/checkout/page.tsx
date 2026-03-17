import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { useCart, CartItem } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { createOrder } from '../../lib/orders';

interface FormData {
  email: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building: string;
  phone: string;
  paymentMethod: 'credit' | 'convenience' | 'bank';
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 住所選択モード: 'saved' = 登録済み, 'new' = 別の住所
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('saved');

  const [formData, setFormData] = useState<FormData>({
    email: '',
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    phone: '',
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  });

  // 未認証の場合はログインページへリダイレクト（戻り先を渡す）
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, authLoading, navigate, location.pathname]);

  // プロフィールデータをフォームに反映
  useEffect(() => {
    if (!profile) return;
    const fullName = profile.full_name || '';
    const nameParts = fullName.split(/\s+/);
    setFormData(prev => ({
      ...prev,
      email: profile.email || user?.email || '',
      lastName: nameParts[0] || '',
      firstName: nameParts[1] || '',
      postalCode: profile.postal_code || '',
      prefecture: profile.prefecture || '',
      city: profile.city || '',
      address: profile.address || '',
      building: profile.building || '',
      phone: profile.phone || '',
    }));
    // 登録済み住所がなければ「別の住所」モードに切り替え
    if (!profile.postal_code && !profile.address) {
      setAddressMode('new');
    }
  }, [profile, user]);

  // カートが空の場合はカートページへリダイレクト
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const hasSavedAddress = !!(profile?.postal_code || profile?.address);

  const subtotal = totalAmount;
  const shippingFee = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + shippingFee;

  useEffect(() => {
    // 支払い方法がクレジットカードの場合、Payment Intentを作成
    if (currentStep === 2 && formData.paymentMethod === 'credit' && total > 0) {
      const createPaymentIntent = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('create-payment-intent', {
            body: { amount: total, currency: 'jpy' },
          });

          if (error) throw error;
          if (data?.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        } catch (error) {
          console.error('Error creating payment intent:', error);
        }
      };
      createPaymentIntent();
    }
  }, [currentStep, formData.paymentMethod, total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // 注文完了処理
      navigate('/order-complete');
    }
  };

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* ステップインジケーター */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base font-bold transition-all ${currentStep >= step
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 md:w-16 h-1 mx-1 md:mx-2 transition-all ${currentStep > step ? 'bg-gray-900' : 'bg-gray-200'
                      }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 md:gap-20 mt-3 md:mt-4">
              <span className={`text-xs md:text-sm font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                配送情報
              </span>
              <span className={`text-xs md:text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                支払い方法
              </span>
              <span className={`text-xs md:text-sm font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                確認
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* フォームエリア */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {/* ステップ1: 配送情報 */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">配送先</h2>

                    {/* 住所切り替え */}
                    {hasSavedAddress && (
                      <div className="mb-6 space-y-3">
                        <label
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${addressMode === 'saved' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}
                          onClick={() => setAddressMode('saved')}
                        >
                          <input type="radio" checked={addressMode === 'saved'} readOnly className="mt-1 w-4 h-4" />
                          <div className="text-sm">
                            <p className="font-medium mb-1">登録済みの住所を使う</p>
                            <p className="text-gray-600">
                              {profile?.full_name}　{profile?.phone}<br />
                              〒{profile?.postal_code}　{profile?.prefecture}{profile?.city}{profile?.address}
                              {profile?.building && `　${profile.building}`}
                            </p>
                          </div>
                        </label>
                        <label
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${addressMode === 'new' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}
                          onClick={() => setAddressMode('new')}
                        >
                          <input type="radio" checked={addressMode === 'new'} readOnly className="w-4 h-4" />
                          <p className="text-sm font-medium">別の住所を入力する</p>
                        </label>
                      </div>
                    )}

                    <div className={`space-y-4 md:space-y-6 ${addressMode === 'saved' && hasSavedAddress ? 'hidden' : ''}`}>
                      <div>
                        <label className="block text-xs md:text-sm font-medium mb-2">
                          メールアドレス <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm md:text-base"
                          placeholder="example@email.com"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-2">
                            姓 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm md:text-base"
                            placeholder="山田"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-2">
                            名 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm md:text-base"
                            placeholder="太郎"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            セイ <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastNameKana"
                            value={formData.lastNameKana}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                            placeholder="ヤマダ"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            メイ <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstNameKana"
                            value={formData.firstNameKana}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                            placeholder="タロウ"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          郵便番号 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                          placeholder="123-4567"
                          maxLength={8}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          都道府県 <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="prefecture"
                          value={formData.prefecture}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm cursor-pointer"
                        >
                          <option value="">選択してください</option>
                          {prefectures.map((pref) => (
                            <option key={pref} value={pref}>{pref}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          市区町村 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                          placeholder="渋谷区"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          番地 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                          placeholder="道玄坂1-2-3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          建物名・部屋番号
                        </label>
                        <input
                          type="text"
                          name="building"
                          value={formData.building}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                          placeholder="〇〇マンション101号室"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          電話番号 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required={addressMode === 'new' || !hasSavedAddress}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                          placeholder="090-1234-5678"
                        />
                      </div>
                    </div>{/* end of new address form */}

                    <div className="flex flex-col sm:flex-row justify-between mt-6 md:mt-8 gap-4">
                      <Link
                        to="/cart"
                        className="inline-flex items-center justify-center gap-2 text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-arrow-left-line"></i>
                        <span>カートに戻る</span>
                      </Link>
                      <button
                        type="submit"
                        className="px-6 md:px-8 py-2.5 md:py-3 bg-gray-900 text-white rounded-lg text-sm md:text-base font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        支払い方法へ進む
                      </button>
                    </div>
                  </div>
                )}

                {/* ステップ2: 支払い方法 */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-lg p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">支払い方法</h2>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="credit"
                            checked={formData.paymentMethod === 'credit'}
                            onChange={handleInputChange}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2">
                              <i className="ri-bank-card-line text-xl"></i>
                              <span className="font-medium">クレジットカード</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Visa、Mastercard、JCB、AMEX</p>
                          </div>
                        </label>

                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="convenience"
                            checked={formData.paymentMethod === 'convenience'}
                            onChange={handleInputChange}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2">
                              <i className="ri-store-2-line text-xl"></i>
                              <span className="font-medium">コンビニ決済</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">セブンイレブン、ファミリーマート、ローソン</p>
                          </div>
                        </label>

                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank"
                            checked={formData.paymentMethod === 'bank'}
                            onChange={handleInputChange}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2">
                              <i className="ri-bank-line text-xl"></i>
                              <span className="font-medium">銀行振込</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">入金確認後に発送</p>
                          </div>
                        </label>
                      </div>

                      {formData.paymentMethod === 'credit' && (
                        <div className="pt-6 border-t">
                          {clientSecret ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                              <PaymentForm
                                setCurrentStep={setCurrentStep}
                                formData={formData}
                                clearCart={clearCart}
                                cartItems={cartItems}
                                totalAmount={totalAmount}
                                addressMode={addressMode}
                                profile={profile}
                              />
                            </Elements>
                          ) : (
                            <div className="text-center py-4">
                              読み込み中...
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-8">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-arrow-left-line"></i>
                        <span>配送情報に戻る</span>
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        確認画面へ進む
                      </button>
                    </div>
                  </div>
                )}

                {/* ステップ3: 確認 */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-8 shadow-sm">
                      <h2 className="text-2xl font-bold mb-6">配送先情報</h2>
                      {addressMode === 'saved' && hasSavedAddress ? (
                        <div className="text-sm text-gray-700 space-y-1">
                          <p className="font-medium">{profile?.full_name}</p>
                          <p>〒{profile?.postal_code}</p>
                          <p>{profile?.prefecture}{profile?.city}{profile?.address}{profile?.building && `　${profile.building}`}</p>
                          <p>{profile?.phone}</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-sm">
                          <div className="flex">
                            <span className="text-gray-600 w-32">お名前：</span>
                            <span className="font-medium">{formData.lastName} {formData.firstName}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-600 w-32">フリガナ：</span>
                            <span className="font-medium">{formData.lastNameKana} {formData.firstNameKana}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-600 w-32">電話番号：</span>
                            <span className="font-medium">{formData.phone}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-600 w-32">住所：</span>
                            <div className="font-medium">
                              <div>〒{formData.postalCode}</div>
                              <div>{formData.prefecture}{formData.city}{formData.address}</div>
                              {formData.building && <div>{formData.building}</div>}
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="mt-4 text-sm text-orange-600 hover:text-orange-700 cursor-pointer whitespace-nowrap"
                      >
                        変更する
                      </button>
                    </div>

                    <div className="bg-white rounded-lg p-8 shadow-sm">
                      <h2 className="text-2xl font-bold mb-6">支払い方法</h2>
                      <div className="flex items-center gap-3 text-sm">
                        <i className={`text-xl ${formData.paymentMethod === 'credit' ? 'ri-bank-card-line' :
                          formData.paymentMethod === 'convenience' ? 'ri-store-2-line' :
                            'ri-bank-line'
                          }`}></i>
                        <span className="font-medium">
                          {formData.paymentMethod === 'credit' ? 'クレジットカード' :
                            formData.paymentMethod === 'convenience' ? 'コンビニ決済' :
                              '銀行振込'}
                        </span>
                      </div>
                      {formData.paymentMethod === 'credit' && formData.cardNumber && (
                        <div className="mt-3 text-sm text-gray-600">
                          **** **** **** {formData.cardNumber.slice(-4)}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="mt-4 text-sm text-orange-600 hover:text-orange-700 cursor-pointer whitespace-nowrap"
                      >
                        編集する
                      </button>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <div className="flex items-start gap-3">
                        <i className="ri-information-line text-xl text-orange-600 flex-shrink-0 mt-0.5"></i>
                        <div className="text-sm text-gray-700">
                          <p className="font-medium mb-2">ご注文前にご確認ください</p>
                          <ul className="space-y-1 text-xs">
                            <li>• 商品は中古品のため、返品・交換は商品に重大な欠陥がある場合のみ可能です</li>
                            <li>• 配送は通常3〜5営業日でお届けします</li>
                            <li>• ご注文確定後のキャンセルはできません</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white rounded-lg p-6 shadow-sm">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="w-5 h-5 mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                        <a href="#" className="text-orange-600 hover:underline">利用規約</a>と
                        <a href="#" className="text-orange-600 hover:underline">プライバシーポリシー</a>に同意します
                      </label>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-arrow-left-line"></i>
                        <span>支払い方法に戻る</span>
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-4 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap text-lg"
                      >
                        注文を確定する
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* 注文サマリー */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm sticky top-20 md:top-24">
                <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">注文内容</h2>

                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 md:gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs md:text-sm mb-1 truncate">{item.name}</h3>
                        <p className="text-xs text-gray-600 mb-1.5 md:mb-2">
                          {item.size} / {item.color}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">数量: {item.quantity}</span>
                          <span className="font-bold text-xs md:text-sm">¥{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">小計</span>
                    <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">送料</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">無料</span>
                      ) : (
                        `¥${shippingFee.toLocaleString()}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <span className="font-bold text-base md:text-lg">合計</span>
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-bold">¥{total.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">税込</div>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="ri-shield-check-line text-sm md:text-base text-green-600"></i>
                    <span>SSL暗号化通信で安全</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="ri-truck-line text-sm md:text-base text-green-600"></i>
                    <span>3〜5営業日でお届け</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="ri-customer-service-2-line text-sm md:text-base text-green-600"></i>
                    <span>カスタマーサポート対応</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PaymentForm({ setCurrentStep, formData, clearCart, cartItems, totalAmount, addressMode, profile }: {
  setCurrentStep: (step: number) => void,
  formData: FormData,
  clearCart: () => void,
  cartItems: CartItem[],
  totalAmount: number,
  addressMode: 'saved' | 'new',
  profile: any,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // リダイレクトを制御するため
      confirmParams: {
        return_url: `${window.location.origin}/order-complete`,
        payment_method_data: {
          billing_details: {
            email: formData.email,
            name: `${formData.lastName} ${formData.firstName}`,
            phone: formData.phone,
            address: {
              postal_code: formData.postalCode,
              state: formData.prefecture,
              city: formData.city,
              line1: formData.address,
              line2: formData.building,
            }
          }
        }
      },
    });

    if (paymentError) {
      setError(paymentError.message ?? '支払い処理中にエラーが発生しました');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        // 注文データの作成
        const shippingAddress = addressMode === 'saved' && profile
          ? {
              name: profile.full_name,
              postal_code: profile.postal_code,
              prefecture: profile.prefecture,
              city: profile.city,
              address: profile.address,
              building: profile.building,
              phone: profile.phone,
            }
          : {
              name: `${formData.lastName} ${formData.firstName}`,
              postal_code: formData.postalCode,
              prefecture: formData.prefecture,
              city: formData.city,
              address: formData.address,
              building: formData.building,
              phone: formData.phone,
            };

        const order = await createOrder({
          totalAmount: totalAmount + (totalAmount >= 5000 ? 0 : 500),
          shippingAddress,
          paymentIntentId: paymentIntent.id,
          cartItems: cartItems
        });

        clearCart();
        navigate('/order-complete', { state: { orderId: order.id } });
      } catch (err) {
        console.error('Order creation failed:', err);
        setError('支払いは完了しましたが、注文処理に失敗しました。サポートにお問い合わせください。');
        setProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line"></i>
          <span>配送情報に戻る</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={!stripe || processing}
          className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          {processing ? '処理中...' : '注文を確定する'}
        </button>
      </div>
    </div>
  );
}
