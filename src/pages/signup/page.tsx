import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import PageMeta from '../../components/PageMeta';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    petName: '',
    petBreed: '',
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('利用規約に同意してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Supabaseでユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            pet_name: formData.petName,
            pet_breed: formData.petBreed,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. profilesテーブルにレコード作成（トリガーがない場合のバックアップ）
        // profileテーブルはschema.sqlで定義済み、idはauth.usersのidを参照
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.petName ? `${formData.petName}の飼い主` : '名無しさん',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // プロフィール作成失敗しても、ユーザー登録は成功しているので続行（または後でリトライ）
        }

        alert('登録確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。');
        navigate('/login');
      }

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="新規登録" noindex />
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">新規登録</h1>
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
                メールアドレス <span className="text-red-500">*</span>
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
                パスワード <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 pr-12"
                  placeholder="8文字以上"
                  minLength={8}
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
              <p className="text-xs text-gray-500 mt-1">8文字以上で入力してください</p>
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 pr-12"
                  placeholder="パスワードを再入力"
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer w-8 h-8 flex items-center justify-center"
                >
                  <i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-xl`}></i>
                </button>
              </div>
            </div>

            {/* ペット情報 */}
            <div className="pt-4 border-t">
              <h3 className="font-bold mb-4 text-sm">ペット情報（任意）</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ペットの名前</label>
                  <input
                    type="text"
                    value={formData.petName}
                    onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    placeholder="例：もも"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">犬種</label>
                  <input
                    type="text"
                    value={formData.petBreed}
                    onChange={(e) => setFormData({ ...formData, petBreed: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    placeholder="例：柴犬"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* 利用規約 */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-1 w-4 h-4 cursor-pointer"
                required
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                <Link to="/terms" className="text-orange-600 hover:underline">利用規約</Link>
                および
                <Link to="/privacy" className="text-orange-600 hover:underline">プライバシーポリシー</Link>
                に同意します
              </label>
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-orange-600 text-white rounded-lg transition-colors font-medium whitespace-nowrap ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-700 cursor-pointer'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>登録処理中...</span>
                </div>
              ) : (
                '登録する'
              )}
            </button>
          </form>

          {/* ログインリンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちの方は
              <Link to="/login" className="text-orange-600 hover:underline ml-1 cursor-pointer">
                ログイン
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
                Googleで登録
              </button>
              <button
                type="button"
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <i className="ri-apple-fill text-xl"></i>
                Appleで登録
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
