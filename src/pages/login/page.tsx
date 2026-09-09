import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import PageMeta from '../../components/PageMeta';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      // ログイン前のページへ戻る（なければトップ）
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="ログイン" noindex />
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-[26px] font-medium tracking-[.08em] mb-2">ログイン</h1>
            <p className="text-sm text-[#6f6f6a] leading-relaxed">RePawへようこそ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="example@email.com"
                disabled={loading}
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-medium mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-2 focus:ring-[#161616] pr-12"
                  placeholder="パスワードを入力"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer w-8 h-8 flex items-center justify-center"
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-xl`}></i>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-[#161616] underline underline-offset-4 hover:text-[#6f6f6a] cursor-pointer">
                パスワードを忘れた
              </Link>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-[#161616] text-white rounded-sm transition-colors font-medium whitespace-nowrap ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#333] cursor-pointer'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ログイン中...</span>
                </div>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* 新規登録リンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は
              <Link to="/signup" className="text-[#161616] underline underline-offset-4 hover:text-[#6f6f6a] ml-1 cursor-pointer">
                新規登録
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
