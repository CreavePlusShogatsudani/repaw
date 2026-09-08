import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import PageMeta from '../../components/PageMeta';

// パスワード再設定メールのリンク先。
// Supabase が URL のトークンからリカバリーセッションを張った後、新しいパスワードを updateUser で保存する。
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setHasSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。');
      return;
    }
    if (password !== confirm) {
      setError('パスワードが一致しません。');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError('パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。');
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="パスワード再設定" noindex />
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-6">
          {hasSession === null ? (
            <div className="text-center py-16 text-gray-500">確認中...</div>
          ) : done ? (
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
                <i className="ri-checkbox-circle-line text-4xl text-green-600"></i>
              </div>
              <h1 className="text-3xl font-bold mb-4">パスワードを更新しました</h1>
              <p className="text-gray-600 text-sm mb-8 font-light">新しいパスワードでログインされています。</p>
              <button
                onClick={() => navigate('/mypage')}
                className="block w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium whitespace-nowrap"
              >
                マイページへ
              </button>
            </div>
          ) : !hasSession ? (
            <div className="text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-4">
                <i className="ri-error-warning-line text-3xl text-red-600"></i>
              </div>
              <h1 className="text-3xl font-bold mb-2">リンクが無効です</h1>
              <p className="text-gray-600 text-sm font-light mb-8">
                パスワード再設定リンクが無効か、有効期限が切れています。<br />
                もう一度リセットメールを送信してください。
              </p>
              <Link
                to="/forgot-password"
                className="block w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium whitespace-nowrap"
              >
                リセットメールを再送信
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 flex items-center justify-center bg-orange-100 rounded-full mx-auto mb-4">
                  <i className="ri-lock-password-line text-3xl text-orange-600"></i>
                </div>
                <h1 className="text-3xl font-bold mb-2">新しいパスワード</h1>
                <p className="text-gray-600 text-sm font-light">新しいパスワードを入力してください。</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">新しいパスワード</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="8文字以上"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">新しいパスワード（確認）</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? '更新中...' : 'パスワードを更新'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
