import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="shop-footer">
      <div className="shop-container">
        <div className="shop-footer-main">
          <div><Link to="/" className="shop-logo">RePaw</Link><p className="mt-4 text-sm leading-7">お気に入りを、次のうちの子へ。<br />犬服のリユースでつながる、新しい暮らし。</p></div>
          <div><h2>お買い物・買取</h2><Link to="/products">犬服を探す</Link><Link to="/features">特集・読みもの</Link><Link to="/buyback">買取を申し込む</Link><Link to="/system">買取・寄付の仕組み</Link></div>
          <div><h2>RePawについて</h2><Link to="/about">運営について</Link><Link to="/impact">動物たちへの支援</Link><Link to="/news">お知らせ</Link></div>
          <div><h2>ご利用ガイド</h2><Link to="/faq">よくある質問</Link><Link to="/contact">お問い合わせ</Link><Link to="/mypage">マイページ</Link></div>
        </div>
        <div className="shop-footer-bottom"><span>© {new Date().getFullYear()} RePaw</span><span>一着を大切に、もう一度。</span></div>
      </div>
    </footer>
  );
}
