import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BuybackRequest {
  id: string;
  item_type: string | null;
  item_description: string | null;
  estimated_price: number | null;
  status: string;
  payout_method: string | null;
}

export default function BuybackResponsePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [request, setRequest] = useState<BuybackRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [payoutMethod, setPayoutMethod] = useState<'donate' | 'transfer'>('donate');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccountType, setBankAccountType] = useState('普通');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchRequest();
  }, [user, authLoading]);

  const fetchRequest = async () => {
    const { data, error } = await supabase
      .from('buyback_requests')
      .select('id, item_type, item_description, estimated_price, status, payout_method')
      .eq('id', id)
      .eq('user_id', user!.id)
      .single();

    if (error || !data) {
      alert('申込情報が見つかりません。');
      navigate('/mypage');
      return;
    }
    setRequest(data as BuybackRequest);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutMethod === 'transfer') {
      if (!bankName || !bankBranch || !bankAccountNumber || !bankAccountHolder) {
        alert('口座情報をすべて入力してください。');
        return;
      }
    }
    setSubmitting(true);

    const updateData: any = {
      payout_method: payoutMethod,
      status: 'accepted',
      user_responded_at: new Date().toISOString(),
    };
    if (payoutMethod === 'transfer') {
      updateData.bank_name = bankName;
      updateData.bank_branch = bankBranch;
      updateData.bank_account_type = bankAccountType;
      updateData.bank_account_number = bankAccountNumber;
      updateData.bank_account_holder = bankAccountHolder;
    }

    const { error } = await supabase
      .from('buyback_requests')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user!.id);

    if (error) {
      alert('送信に失敗しました。もう一度お試しください。');
      setSubmitting(false);
      return;
    }

    navigate('/mypage', { state: { tab: 'sell', message: 'response_sent' } });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) return null;

  // 既に回答済み
  if (request.payout_method) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <i className="ri-checkbox-circle-line text-5xl text-green-500 mb-4 block"></i>
          <h1 className="text-2xl font-bold mb-4">回答済みです</h1>
          <p className="text-gray-600 mb-8">この申込への回答は完了しています。</p>
          <button onClick={() => navigate('/mypage')} className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            マイページへ戻る
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-2">査定結果のご確認</h1>
        <p className="text-gray-500 text-sm mb-10">査定結果をご確認いただき、受け取り方法をお選びください。</p>

        {/* 査定結果 */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-10">
          <p className="text-sm text-gray-600 mb-1">{request.item_type || '商品'}</p>
          <p className="text-xs text-gray-400 mb-4">{request.item_description}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-600 text-sm">査定額</span>
            <span className="text-3xl font-bold text-orange-600">
              ¥{(request.estimated_price ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 回答フォーム */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <p className="font-bold mb-4">受け取り方法を選んでください</p>
            <div className="space-y-3">
              <label className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${payoutMethod === 'donate' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payout" value="donate" checked={payoutMethod === 'donate'} onChange={() => setPayoutMethod('donate')} className="mt-0.5 accent-orange-500" />
                <div>
                  <p className="font-bold">全額を動物保護団体に寄付する</p>
                  <p className="text-sm text-gray-500 mt-1">査定額の全額が保護犬・保護猫の支援に使われます。</p>
                </div>
              </label>
              <label className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${payoutMethod === 'transfer' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payout" value="transfer" checked={payoutMethod === 'transfer'} onChange={() => setPayoutMethod('transfer')} className="mt-0.5" />
                <div>
                  <p className="font-bold">口座振込で受け取る</p>
                  <p className="text-sm text-gray-500 mt-1">査定額をご指定の口座へ振り込みます。なお商品が販売された際には、販売額の5%が自動的に動物保護団体へ寄付されます。</p>
                </div>
              </label>
            </div>
          </div>

          {/* 口座情報入力 */}
          {payoutMethod === 'transfer' && (
            <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <p className="font-bold text-sm">振込先口座情報</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">銀行名 *</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="例: ○○銀行" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">支店名 *</label>
                  <input type="text" value={bankBranch} onChange={e => setBankBranch(e.target.value)} placeholder="例: △△支店" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">口座種別 *</label>
                  <select value={bankAccountType} onChange={e => setBankAccountType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">口座番号 *</label>
                  <input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="例: 1234567" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">口座名義（カタカナ） *</label>
                <input type="text" value={bankAccountHolder} onChange={e => setBankAccountHolder(e.target.value)} placeholder="例: ヤマダ タロウ" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {submitting ? '送信中...' : '回答を送信する'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
