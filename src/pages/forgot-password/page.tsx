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
    <div className="min-h-screen bg-white font-['Noto_Sans_JP']">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-6">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 flex items-center justify-center bg-orange-100 rounded-full mx-auto mb-4">
                  <i className="ri-lock-password-line text-3xl text-orange-600"></i>
                </div>
                <h1 className="text-3xl font-bold mb-2">パスワードを忘れた</h1>
                <p className="text-gray-600 text-sm font-light">
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
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="example@email.com"
                    disabled={loading}
                  />
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? '送信中...' : 'リセットリンクを送信'}
                </button>
              </form>

              {/* ログインに戻る */}
              <div className="mt-6 text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-orange-500 hover:underline cursor-pointer inline-flex items-center gap-1"
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
                <h1 className="text-3xl font-bold mb-4">メールを送信しました</h1>
                <p className="text-gray-600 mb-2 font-light leading-relaxed">
                  <strong className="text-gray-900">{email}</strong> 宛に<br />
                  パスワードリセット用のリンクを送信しました。
                </p>
                <p className="text-gray-600 text-sm mb-8 font-light">
                  メールが届かない場合は、迷惑メールフォルダもご確認ください。
                </p>

                {/* アクションボタン */}
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium whitespace-nowrap text-center"
                  >
                    ログインページへ
                  </Link>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-medium whitespace-nowrap"
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
                      <Link to="/" className="text-orange-500 hover:underline cursor-pointer">
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
