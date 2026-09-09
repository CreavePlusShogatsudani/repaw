
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface OrderOption {
  id: string;
  created_at: string;
  order_items: { products: { name: string } | null }[];
}

// standalone: /contact ページ用。折りたたみ（details）なしでフォームを直接表示する
export default function ContactSection({ standalone = false }: { standalone?: boolean }) {
  const { hash } = useLocation();
  const { user, loading } = useAuth();
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (hash !== '#contact' || !details.current) return;
    details.current.open = true;
    const frame = requestAnimationFrame(() => document.getElementById('contact')?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [orders, setOrders] = useState<OrderOption[]>([]);

  // 注文選択用に自分の注文を取得
  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('id, created_at, order_items(products(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data as unknown as OrderOption[]) || []));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const { data, error } = await supabase.functions.invoke('handle-inquiry', {
        body: {
          subject: formData.get('subject'),
          body: formData.get('message'),
          order_id: formData.get('order_id') || null,
        },
      });

      if (!error && data?.id) {
        setSubmitStatus('success');
        form.reset();
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = loading ? null : !user ? (
    <div className="py-8">
      <p className="text-sm text-[color:var(--rp-text)] mb-5">お問い合わせにはログインが必要です</p>
      <Link
        to="/login"
        state={{ from: '/contact' }}
        className="rp-btn rp-btn-black"
      >
        ログインする
      </Link>
    </div>
  ) : (
        <form
          id="contact-form"
          onSubmit={handleSubmit}
          className="space-y-6 pt-8 pb-4"
        >
          <div>
            <label htmlFor="subject" className="block text-xs tracking-[.06em] text-[color:var(--rp-muted)] mb-2">件名 *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              maxLength={100}
              disabled={isSubmitting}
              className="rp-input disabled:bg-gray-100"
            />
          </div>

          {orders.length > 0 && (
            <div>
              <label htmlFor="order_id" className="block text-xs tracking-[.06em] text-[color:var(--rp-muted)] mb-2">関連する注文（任意）</label>
              <select
                id="order_id"
                name="order_id"
                disabled={isSubmitting}
                className="rp-input disabled:bg-gray-100"
              >
                <option value="">選択しない</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {new Date(o.created_at).toLocaleDateString('ja-JP')} / {o.id.split('-')[0].toUpperCase()} / {o.order_items.map((i) => i.products?.name || '商品').join('、')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="message" className="block text-xs tracking-[.06em] text-[color:var(--rp-muted)] mb-2">お問い合わせ内容 *</label>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              maxLength={500}
              disabled={isSubmitting}
              className="rp-input resize-none disabled:bg-gray-100"
              placeholder="500文字以内でご入力ください"
            />
          </div>

          {submitStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-sm text-green-800 text-sm">
              お問い合わせを受け付けました。回答はマイページの「問い合わせ履歴」からご確認いただけます。
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-800 text-sm">
              送信に失敗しました。もう一度お試しください。
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rp-btn rp-btn-black min-w-[240px] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
          </div>
        </form>
  );

  if (standalone) {
    return <div className="max-w-4xl mx-auto">{content}</div>;
  }

  return (
    <section id="contact" className="shop-container shop-contact">
      <div className="max-w-4xl mx-auto">
        <details ref={details}>
        <summary className="shop-contact-toggle"><span>お困りのことはありますか？<small>商品についてのご質問・お問い合わせ</small></span><span className="shop-contact-label">フォームを開く ＋</span></summary>
        {content}
        </details>
      </div>
    </section>
  );
}
