import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
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

      // ログイン成功したらマイページへリダイレクト
      navigate('/mypage');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ログイン</h1>
            <p className="text-gray-600">RePowへようこそ</p>
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
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
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
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 pr-12"
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

            {/* ログイン状態を保持 & パスワードを忘れた */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                  disabled={loading}
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  ログイン状態を保持
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-orange-600 hover:underline cursor-pointer">
                パスワードを忘れた
              </Link>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-orange-600 text-white rounded-lg transition-colors font-medium whitespace-nowrap ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-700 cursor-pointer'
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
              <Link to="/signup" className="text-orange-600 hover:underline ml-1 cursor-pointer">
                新規登録
              </Link>
            </p>
          </div>

          {/* ソーシャルログイン */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">または</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <i className="ri-google-fill text-xl text-red-500"></i>
                Googleでログイン
              </button>
              <button
                type="button"
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <i className="ri-apple-fill text-xl"></i>
                Appleでログイン
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
