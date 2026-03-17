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

  return (
    <>
      {/* デスクトップナビゲーション */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-4 md:py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* ロゴ */}
            <Link to="/" className="text-xl md:text-2xl font-bold cursor-pointer transition-colors text-black" style={{ fontFamily: "'Playfair Display', serif" }}>
              RePaw
            </Link>

            {/* デスクトップメニュー */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/products" className={`px-4 py-2 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isScrolled ? 'text-black' : 'text-white hover:bg-white/10'
              }`}>
                アイテム一覧
              </Link>
              <Link to="/system" className={`px-4 py-2 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isScrolled ? 'text-black' : 'text-white hover:bg-white/10'
              }`}>
                買取・寄付
              </Link>
              <Link to="/impact" className={`px-4 py-2 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isScrolled ? 'text-black' : 'text-white hover:bg-white/10'
              }`}>
                社会貢献
              </Link>
              <Link to="/about" className={`px-4 py-2 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isScrolled ? 'text-black' : 'text-white hover:bg-white/10'
              }`}>
                About
              </Link>
              <Link to="/faq" className={`px-4 py-2 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isScrolled ? 'text-black' : 'text-white hover:bg-white/10'
              }`}>
                FAQ
              </Link>
              <Link to="/cart" className={`px-4 py-2 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isScrolled ? 'text-black' : 'text-white hover:bg-white/10'
              }`}>
                <i className="ri-shopping-cart-line text-lg"></i>
              </Link>
              {user ? (
                <div className="flex items-center gap-1">
                  <Link to="/mypage" className={`px-4 py-2 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isScrolled ? 'text-black' : 'text-white hover:bg-white/10'
                  }`}>
                    <i className="ri-user-fill text-lg"></i>
                  </Link>
                  <button onClick={handleLogout} className={`px-3 py-2 text-sm font-medium hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isScrolled ? 'text-black' : 'text-white hover:bg-white/10'
                  }`}>
                    <i className="ri-logout-box-line text-lg"></i>
                  </button>
                </div>
              ) : (
                <Link to="/login" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap border ${
                  isScrolled
                    ? 'text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white'
                    : 'text-white border-white hover:bg-white hover:text-gray-900'
                }`}>
                  ログイン
                </Link>
              )}
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden w-10 h-10 flex items-center justify-center cursor-pointer rounded-lg transition-all duration-200 text-black ${
                isScrolled 
                  ? 'hover:bg-gray-100 active:bg-gray-200' 
                  : 'hover:bg-white/10 active:bg-white/20'
              }`}
            >
              <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg mt-3">
            <div className="px-6 py-4 space-y-2">
              <Link 
                to="/products" 
                className="block text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer px-4 py-3 rounded-lg" 
                onClick={() => setIsMenuOpen(false)}
              >
                アイテム一覧
              </Link>
              <Link 
                to="/system" 
                className="block text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer px-4 py-3 rounded-lg" 
                onClick={() => setIsMenuOpen(false)}
              >
                買取・寄付
              </Link>
              <Link 
                to="/impact" 
                className="block text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer px-4 py-3 rounded-lg" 
                onClick={() => setIsMenuOpen(false)}
              >
                社会貢献
              </Link>
              <Link 
                to="/about" 
                className="block text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer px-4 py-3 rounded-lg" 
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/faq" 
                className="block text-sm font-medium text-black hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer px-4 py-3 rounded-lg" 
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex gap-2 pt-2">
                <Link 
                  to="/cart" 
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-all cursor-pointer px-4 py-3 rounded-lg whitespace-nowrap" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="ri-shopping-cart-line text-lg"></i>
                  カート
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/mypage"
                      className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 transition-all cursor-pointer px-4 py-3 rounded-lg whitespace-nowrap"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="ri-user-fill text-lg"></i>
                      マイページ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer px-4 py-3 rounded-lg whitespace-nowrap"
                    >
                      <i className="ri-logout-box-line text-lg"></i>
                      ログアウト
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 transition-all cursor-pointer px-4 py-3 rounded-lg whitespace-nowrap"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="ri-user-line text-lg"></i>
                    ログイン
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
