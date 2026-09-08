import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { supabase } from '../../../lib/supabase';

const links = [
  { to: '/products', label: '犬服を探す' },
  { to: '/features', label: '特集・読みもの' },
  { to: '/system', label: '買取・寄付' },
  { to: '/about', label: 'RePawについて' },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="shop-header">
      <nav className="shop-container shop-nav" aria-label="メインメニュー">
        <Link to="/" className="shop-logo" onClick={() => setIsMenuOpen(false)}>RePaw<span>犬服のリユースショップ</span></Link>
        <div className="shop-desktop-links">
          {links.map(link => <Link key={link.to} to={link.to} aria-current={pathname === link.to ? 'page' : undefined}>{link.label}</Link>)}
        </div>
        <div className="shop-nav-actions">
          <Link to={user ? '/mypage' : '/login'} className="shop-account" aria-label={user ? 'マイページ' : 'ログイン'}><i className="ri-user-line" aria-hidden="true" /><span>{user ? 'マイページ' : 'ログイン'}</span></Link>
          <Link to="/cart" className="shop-cart" aria-label={`カート${itemCount > 0 ? `、${itemCount}点` : ''}`} onClick={() => setIsMenuOpen(false)}><i className="ri-shopping-bag-line" aria-hidden="true" />{itemCount > 0 && <span>{itemCount > 99 ? '99+' : itemCount}</span>}</Link>
          <button ref={menuButton} type="button" className="shop-menu-button" aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'} aria-expanded={isMenuOpen} aria-controls="shop-mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}><i className={isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} aria-hidden="true" /></button>
        </div>
      </nav>
      {isMenuOpen && <nav id="shop-mobile-menu" className="shop-mobile-menu" aria-label="追加メニュー">
        {[...links, { to: '/buyback', label: '買取を申し込む' }, { to: '/impact', label: '動物たちへの支援' }, { to: '/news', label: 'お知らせ' }, { to: '/faq', label: 'よくある質問' }].map(link => <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}>{link.label}<span aria-hidden="true">→</span></Link>)}
        <Link to={user ? '/mypage' : '/login'} onClick={() => setIsMenuOpen(false)}>{user ? 'マイページ' : 'ログイン / 新規登録'}</Link>
        {user && <button type="button" onClick={handleLogout}>ログアウト</button>}
      </nav>}
    </header>
  );
}
