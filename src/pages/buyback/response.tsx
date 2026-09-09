import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import PageHeader from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BUYBACK_ITEM_PUBLIC_SELECT, itemDisplayName, requestTotal, type BuybackItem } from '../../lib/buyback';
import { DONATION_RATE, DONATION_RATE_LABEL } from '../../lib/donation';

interface BuybackRequest {
  id: string;
  status: string;
  payout_method: string | null;
  return_preference: 'donate' | 'return_cod';
  buyback_items: BuybackItem[];
}

type Choice = 'donate' | 'transfer' | 'return';

// 査定結果の確認と回答。服1点ごとの内訳を見せ、申込全体で1回だけ回答する
export default function BuybackResponsePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [request, setRequest] = useState<BuybackRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [choice, setChoice] = useState<Choice>('donate');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccountType, setBankAccountType] = useState('普通');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { state: { from: `/buyback/response/${id}` } }); return; }
    supabase
      .from('buyback_requests')
      .select(`id, status, payout_method, return_preference, buyback_items(${BUYBACK_ITEM_PUBLIC_SELECT})`)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          alert('申込情報が見つかりません。');
          navigate('/mypage', { state: { tab: 'sell' } });
          return;
        }
        const req = data as unknown as BuybackRequest;
        req.buyback_items = [...(req.buyback_items || [])].sort((a, b) => a.sort_order - b.sort_order);
        setRequest(req);
        setLoading(false);
      });
  }, [user, authLoading, id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (choice === 'transfer' && (!bankName || !bankBranch || !bankAccountNumber || !bankAccountHolder)) {
      alert('口座情報をすべて入力してください。');
      return;
    }
    if (choice === 'return' && !confirm('全点を着払いで返送します。よろしいですか？')) return;
    setSubmitting(true);

    // 一般ユーザーは buyback_requests を直接 UPDATE できないため、回答専用 RPC を使う（010_buyback_items.sql）
    const { error } = await supabase.rpc('respond_buyback', {
      p_id: id,
      p_payout_method: choice,
      ...(choice === 'transfer' ? {
        p_bank_name: bankName,
        p_bank_branch: bankBranch,
        p_bank_account_type: bankAccountType,
        p_bank_account_number: bankAccountNumber,
        p_bank_account_holder: bankAccountHolder,
      } : {}),
    });

    if (error) {
      alert('送信に失敗しました。もう一度お試しください。');
      setSubmitting(false);
      return;
    }
    navigate('/mypage', { state: { tab: 'sell' } });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) return null;

  const items = request.buyback_items;
  const buyable = items.filter((i) => i.decision === 'buyable');
  const rejected = items.filter((i) => i.decision === 'not_buyable');
  const total = requestTotal(items);

  // 既に回答済み、または回答できる状態ではない
  if (request.status !== 'quoted') {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="page">
          <div className="shop-container max-w-[40em] mx-auto py-24 text-center">
            <h1 className="text-[26px] font-medium tracking-[.08em]">この申込は回答済みです</h1>
            <p className="mt-4 text-sm text-[color:var(--rp-muted)]">内容はマイページの買取履歴からご確認いただけます。</p>
            <button onClick={() => navigate('/mypage', { state: { tab: 'sell' } })} className="rp-btn rp-btn-black mt-8">マイページへ戻る</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="page">
        <div className="shop-container max-w-[44em] mx-auto pb-24">
          <PageHeader eyebrow="Appraisal" title="査定結果のご確認" lead="お送りいただいた服を1点ずつ査定しました。内容をご確認のうえ、受け取り方法をお選びください。" />

          {/* 内訳 */}
          <section className="border-t border-[color:var(--rp-line)]">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[88px_1fr_auto] gap-5 py-6 border-b border-[color:var(--rp-line)] items-start">
                <div className="aspect-[4/5] bg-[color:var(--rp-photo-bg)] overflow-hidden">
                  {item.intake_photos?.[0] && <img src={item.intake_photos[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="text-[15px] font-medium tracking-[.02em]">{itemDisplayName(item)}</p>
                  {item.decision === 'not_buyable' ? (
                    <p className="mt-2 text-sm text-[color:var(--rp-muted)]">買取不可{item.reject_reason ? `：${item.reject_reason}` : ''}</p>
                  ) : (
                    <>
                      {item.rank && <p className="mt-1 text-xs tracking-[.06em] text-[color:var(--rp-muted)]">{item.rank}ランク</p>}
                      {item.appraisal_comment && <p className="mt-2 text-sm leading-7 text-[color:var(--rp-text)]">{item.appraisal_comment}</p>}
                    </>
                  )}
                </div>
                <p className="text-right text-[16px] font-medium tabular-nums">
                  {item.decision === 'buyable' ? `¥${(item.buyback_price ?? 0).toLocaleString()}` : <span className="text-[color:var(--rp-muted)]">-</span>}
                </p>
              </div>
            ))}
            <div className="flex justify-between items-baseline py-6">
              <p className="text-sm tracking-[.06em]">買取額 合計（{buyable.length}点）</p>
              <p className="text-[28px] font-medium tabular-nums">¥{total.toLocaleString()}</p>
            </div>
            {rejected.length > 0 && (
              <p className="text-sm leading-7 text-[color:var(--rp-muted)] pb-6">
                買取不可の{rejected.length}点は、お申し込み時にお選びいただいた方法（{request.return_preference === 'return_cod' ? '着払いでの返送' : '寄付'}）で対応します。
              </p>
            )}
          </section>

          {/* 回答 */}
          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            <div>
              <p className="text-sm tracking-[.06em] mb-4">受け取り方法</p>
              <div className="space-y-3">
                {([
                  { value: 'donate', title: '全額を動物保護団体に寄付する', text: '買取額の全額が保護犬・保護猫の支援に使われます。' },
                  { value: 'transfer', title: '口座振込で受け取る', text: `買取額をご指定の口座へ振り込みます。商品が販売された際には、販売額の${DONATION_RATE_LABEL}が動物保護団体へ寄付されます。` },
                  { value: 'return', title: '査定額に納得できないので、全点を返送してもらう', text: '着払いでお返しします。買取不可の服も一緒にお返しします。' },
                ] as { value: Choice; title: string; text: string }[]).map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-4 p-5 rounded-sm border cursor-pointer transition-colors ${choice === opt.value ? 'border-[#161616] bg-[#f3f2ee]' : 'border-[color:var(--rp-line)] hover:border-gray-400'}`}>
                    <input type="radio" name="choice" value={opt.value} checked={choice === opt.value} onChange={() => setChoice(opt.value)} className="mt-1 accent-[#161616]" />
                    <div>
                      <p className="text-[15px] font-medium">{opt.title}</p>
                      <p className="text-sm leading-6 text-[color:var(--rp-muted)] mt-1">{opt.text}</p>
                      {opt.value === 'transfer' && total > 0 && (
                        <p className="text-xs text-[color:var(--rp-muted)] mt-1">販売時の寄付の目安: 約 ¥{Math.floor(total * DONATION_RATE).toLocaleString()}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {choice === 'transfer' && (
              <div className="space-y-4 p-6 bg-[#f3f2ee] rounded-sm border border-[color:var(--rp-line)]">
                <p className="text-sm tracking-[.06em]">振込先口座</p>
                <div className="grid grid-cols-2 gap-4">
                  <label className="rp-field !mb-0"><span>銀行名 *</span><input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="例: ○○銀行" className="rp-input" /></label>
                  <label className="rp-field !mb-0"><span>支店名 *</span><input type="text" value={bankBranch} onChange={e => setBankBranch(e.target.value)} placeholder="例: △△支店" className="rp-input" /></label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="rp-field !mb-0"><span>口座種別 *</span>
                    <select value={bankAccountType} onChange={e => setBankAccountType(e.target.value)} className="rp-input">
                      <option value="普通">普通</option>
                      <option value="当座">当座</option>
                    </select>
                  </label>
                  <label className="rp-field !mb-0"><span>口座番号 *</span><input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="例: 1234567" className="rp-input" /></label>
                </div>
                <label className="rp-field !mb-0"><span>口座名義（カタカナ） *</span><input type="text" value={bankAccountHolder} onChange={e => setBankAccountHolder(e.target.value)} placeholder="例: ヤマダ タロウ" className="rp-input" /></label>
              </div>
            )}

            <button type="submit" disabled={submitting} className="rp-btn rp-btn-black w-full disabled:opacity-50">
              {submitting ? '送信中...' : '回答を送信する'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
