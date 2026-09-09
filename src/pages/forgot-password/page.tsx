import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setIsSubmitted(true);
    } catch (err: any) {
      setError('メールの送信に失敗しました。メールアドレスをご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-6">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 flex items-center justify-center bg-[#f3f2ee] rounded-full mx-auto mb-4">
                  <i className="ri-lock-password-line text-3xl text-[#6f6f6a]"></i>
                </div>
                <h1 className="text-[26px] font-medium tracking-[.08em] mb-2">パスワードを忘れた</h1>
                <p className="text-sm text-[#6f6f6a] leading-relaxed">
                  登録されているメールアドレスを入力してください。<br />
                  パスワードリセット用のリンクをお送りします。
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                )}
                {/* メールアドレス */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-[#161616] text-sm"
                    placeholder="example@email.com"
                    disabled={loading}
                  />
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#161616] text-white rounded-sm hover:bg-[#333] transition-colors cursor-pointer font-medium whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? '送信中...' : 'リセットリンクを送信'}
                </button>
              </form>

              {/* ログインに戻る */}
              <div className="mt-6 text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-[#161616] underline underline-offset-4 hover:text-[#6f6f6a] cursor-pointer inline-flex items-center gap-1"
                >
                  <i className="ri-arrow-left-line"></i>
                  ログインに戻る
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
                  <i className="ri-mail-check-line text-4xl text-green-600"></i>
                </div>
                <h1 className="text-[26px] font-medium tracking-[.08em] mb-4">メールを送信しました</h1>
                <p className="text-sm text-[#6f6f6a] leading-relaxed mb-2">
                  <strong className="text-gray-900">{email}</strong> 宛に<br />
                  パスワードリセット用のリンクを送信しました。
                </p>
                <p className="text-sm text-[#6f6f6a] leading-relaxed mb-8">
                  メールが届かない場合は、迷惑メールフォルダもご確認ください。
                </p>

                {/* アクションボタン */}
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full py-3 bg-[#161616] text-white rounded-sm hover:bg-[#333] transition-colors cursor-pointer font-medium whitespace-nowrap text-center"
                  >
                    ログインページへ
                  </Link>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer font-medium whitespace-nowrap"
                  >
                    別のメールアドレスで再送信
                  </button>
                </div>
              </div>

              {/* サポート情報 */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <i className="ri-information-line text-xl text-gray-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-light leading-relaxed">
                      メールが届かない場合や、その他お困りのことがございましたら、
                      <Link to="/contact" className="text-[#161616] underline underline-offset-4 hover:text-[#6f6f6a] cursor-pointer">
                        お問い合わせフォーム
                      </Link>
                      からご連絡ください。
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
