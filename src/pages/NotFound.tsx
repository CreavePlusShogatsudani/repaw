import { Link, useLocation } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Navigation from './home/components/Navigation';
import Footer from './home/components/Footer';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="ページが見つかりません" noindex />
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-7xl font-bold text-gray-200 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>404</p>
          <h1 className="text-2xl font-bold mb-3">ページが見つかりません</h1>
          <p className="text-sm text-gray-600 mb-2">お探しのページは移動または削除された可能性があります。</p>
          <p className="text-xs text-gray-400 font-mono mb-8">{location.pathname}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="px-6 py-3 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
              トップページへ
            </Link>
            <Link to="/products" className="px-6 py-3 border text-sm rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
              犬服を探す
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
