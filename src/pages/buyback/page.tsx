
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BUYBACK_SHIP_TO } from '../../lib/buyback';

export default function BuybackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    itemType: '',
    itemDescription: '',
    condition: '',
    purchaseDate: '',
    instagram: '',
    message: '',
    returnPreference: 'donate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { user, profile, loading: authLoading } = useAuth();

  // プロフィール登録済みの項目をプリフィル（未入力の欄だけ）
  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      name: prev.name || profile?.full_name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || profile?.phone || '',
      address: prev.address || [profile?.postal_code, profile?.prefecture, profile?.city, profile?.address, profile?.building].filter(Boolean).join(' '),
      instagram: prev.instagram || profile?.instagram_account || '',
    }));
  }, [user, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      if (!user) throw new Error('UNAUTHORIZED');

      const { error } = await supabase.from('buyback_requests').insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        item_type: formData.itemType,
        item_description: formData.itemDescription,
        condition: formData.condition,
        purchase_date: formData.purchaseDate,
        return_preference: formData.returnPreference,
        instagram: formData.instagram || null,
        message: formData.message,
      });

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        itemType: '',
        itemDescription: '',
        condition: '',
        purchaseDate: '',
        instagram: '',
        message: '',
        returnPreference: 'donate',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[26px] md:text-[34px] font-medium tracking-[.08em] mb-4">買取申し込み</h1>
            <p className="text-sm text-[#6f6f6a] leading-relaxed">
              不要になったアイテムを買い取らせていただきます。<br />
              以下のフォームに必要事項をご記入ください。
            </p>
          </div>

          {/* 買取申込は会員限定（FAQ の案内どおり）。未ログインの申込は査定回答フローに乗れないため */}
          {authLoading ? null : !user ? (
            <div className="bg-white border border-[#e6e6e1] rounded-sm p-8 text-center">
              <p className="text-sm text-gray-700 mb-4">買取のお申し込みには会員登録・ログインが必要です</p>
              <Link
                to="/login"
                state={{ from: '/buyback' }}
                className="inline-block px-8 py-3 bg-[#161616] text-white text-sm rounded-sm hover:bg-[#333] transition-colors whitespace-nowrap cursor-pointer"
              >
                ログイン / 新規登録
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#e6e6e1] rounded-sm p-8" id="buyback-form">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm"
                  placeholder="090-1234-5678"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  ご住所 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm"
                  placeholder="東京都渋谷区..."
                />
              </div>

              <div>
                <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 mb-2">
                  商品カテゴリー <span className="text-red-500">*</span>
                </label>
                <select
                  id="itemType"
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="衣類">衣類</option>
                  <option value="バッグ">バッグ</option>
                  <option value="靴">靴</option>
                  <option value="アクセサリー">アクセサリー</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  商品の詳細 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="itemDescription"
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleChange}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm resize-none"
                  placeholder="ブランド名、商品名、色、サイズなど"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.itemDescription.length}/500文字</p>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  商品の状態 <span className="text-red-500">*</span>
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="新品・未使用">新品・未使用</option>
                  <option value="未使用に近い">未使用に近い</option>
                  <option value="目立った傷や汚れなし">目立った傷や汚れなし</option>
                  <option value="やや傷や汚れあり">やや傷や汚れあり</option>
                  <option value="傷や汚れあり">傷や汚れあり</option>
                </select>
              </div>

              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  購入時期
                </label>
                <input
                  type="text"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm"
                  placeholder="2023年春頃"
                />
              </div>

              {/* 買取できない服・査定に不同意のときの扱い（送付型のため事前に決めてもらう） */}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  買取できない服があった場合 <span className="text-red-500">*</span>
                </p>
                <div className="space-y-2">
                  {[
                    { value: 'donate', label: '寄付に回す（動物保護団体へ届けます）' },
                    { value: 'return_cod', label: '着払いで返送してもらう' },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-3 p-4 rounded-sm border cursor-pointer text-sm ${formData.returnPreference === opt.value ? 'border-[#161616] bg-[#f3f2ee]' : 'border-gray-300'}`}>
                      <input type="radio" name="returnPreference" value={opt.value} checked={formData.returnPreference === opt.value} onChange={handleChange} className="accent-[#161616]" />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">著しい汚れや破損、においが強いものはお受けできない場合があります。査定額にご納得いただけない場合も、全点を着払いで返送できます。</p>
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagramアカウント <span className="text-gray-400 font-normal">（任意）</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm"
                    placeholder="your_instagram_id"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">入力いただいた場合、商品ページに「このお洋服の元のオーナー」として表示されます</p>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  その他ご要望
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-[#161616] focus:border-transparent text-sm resize-none"
                  placeholder="ご質問やご要望がございましたらご記入ください"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500文字</p>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="mt-6 p-4 bg-[#f3f2ee] border border-[#e6e6e1] rounded-sm">
                <p className="text-[#2a2a28] text-sm">
                  お申し込みありがとうございます。犬服をお手持ちの箱や袋に入れて、下記まで<strong>着払い</strong>でお送りください。送料はRePawが負担します。
                </p>
                <p className="mt-3 text-sm leading-6 text-[#2a2a28]">
                  {BUYBACK_SHIP_TO.postal} {BUYBACK_SHIP_TO.address}<br />
                  {BUYBACK_SHIP_TO.name}<br />
                  TEL {BUYBACK_SHIP_TO.tel}
                </p>
                <p className="mt-3 text-xs text-gray-500">送り先はマイページの「買取申込履歴」からもご確認いただけます。到着後、2〜3営業日で査定結果をお知らせします。</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  送信に失敗しました。もう一度お試しください。
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 w-full bg-[#161616] text-white py-4 rounded-sm font-medium hover:bg-[#333] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? '送信中...' : '申し込む'}
            </button>
          </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
