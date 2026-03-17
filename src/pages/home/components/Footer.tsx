import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">PePaw</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              犬服のリユースで、環境保護と動物保護を支援する新しいエコシステム
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">サービス</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#service" className="text-white/80 hover:text-white transition-colors cursor-pointer">サービス概要</a></li>
              <li><a href="#items" className="text-white/80 hover:text-white transition-colors cursor-pointer">商品一覧</a></li>
              <li><Link to="/system" className="text-white/80 hover:text-white transition-colors cursor-pointer">買取・寄付</Link></li>
              <li><Link to="/impact" className="text-white/80 hover:text-white transition-colors cursor-pointer">社会的価値</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">サポート</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-white/80 hover:text-white transition-colors cursor-pointer">会社概要</Link></li>
              <li><a href="#contact" className="text-white/80 hover:text-white transition-colors cursor-pointer">お問い合わせ</a></li>
              <li><Link to="/faq" className="text-white/80 hover:text-white transition-colors cursor-pointer">よくある質問</Link></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors cursor-pointer">利用規約</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors cursor-pointer">プライバシーポリシー</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">フォロー</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                <i className="ri-facebook-line text-xl"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-orange-200">
          <p className="text-sm text-gray-600">
            © 2024 RePaw. All rights reserved. | <a href="https://readdy.ai/?ref=logo" className="hover:text-orange-600 transition-colors cursor-pointer">Powered by Readdy</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
