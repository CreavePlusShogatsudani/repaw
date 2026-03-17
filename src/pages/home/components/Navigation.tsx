import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // メニュー展開中は背景スクロールを無効化
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <>
      {/* デスクトップナビゲーション */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? 'shadow-md py-3' : 'py-4 md:py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* ロゴ */}
            <Link to="/" className="text-xl md:text-2xl font-bold cursor-pointer transition-colors text-black" style={{ fontFamily: "'Playfair Display', serif" }}>
              RePaw
            </Link>

            {/* デスクトップメニュー */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/products" className="px-4 py-2 text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                アイテム一覧
              </Link>
              <Link to="/system" className="px-4 py-2 text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                買取・寄付
              </Link>
              <Link to="/impact" className="px-4 py-2 text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                社会貢献
              </Link>
              <Link to="/about" className="px-4 py-2 text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                About
              </Link>
              <Link to="/faq" className="px-4 py-2 text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                FAQ
              </Link>
              <Link to="/cart" className="px-4 py-2 text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                <i className="ri-shopping-cart-line text-lg"></i>
              </Link>
              {user ? (
                <div className="flex items-center gap-1">
                  <Link to="/mypage" className="px-4 py-2 text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                    <i className="ri-user-fill text-lg"></i>
                  </Link>
                  <button onClick={handleLogout} className="px-3 py-2 text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                    <i className="ri-logout-box-line text-lg"></i>
                  </button>
                </div>
              ) : (
                <Link to="/login" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap border ${'text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white'
                }`}>
                  ログイン
                </Link>
              )}
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center cursor-pointer rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 text-black"
            >
              <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl`}></i>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4">
              {/* ナビリンク */}
              <div className="space-y-1 mb-4">
                {[
                  { to: '/products', label: 'アイテム一覧' },
                  { to: '/buyback', label: '買取申し込み' },
                  { to: '/system', label: '仕組みについて' },
                  { to: '/impact', label: '社会貢献' },
                  { to: '/about', label: 'About' },
                  { to: '/faq', label: 'FAQ' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 transition-all px-4 py-3 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* アカウント・カートボタン */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <Link
                  to="/cart"
                  className="flex items-center gap-3 w-full text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-all px-4 py-3 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="ri-shopping-cart-line text-lg"></i>
                  カートを見る
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/mypage"
                      className="flex items-center gap-3 w-full text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all px-4 py-3 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="ri-user-line text-lg"></i>
                      マイページ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 transition-all px-4 py-3 rounded-lg"
                    >
                      <i className="ri-logout-box-line text-lg"></i>
                      ログアウト
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 w-full text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all px-4 py-3 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="ri-user-line text-lg"></i>
                    ログイン / 新規登録
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
