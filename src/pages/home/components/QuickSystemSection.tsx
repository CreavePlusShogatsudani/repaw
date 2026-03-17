import { useNavigate } from 'react-router-dom';

export default function QuickSystemSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Buy & Donate</h2>
          <p className="text-gray-600 text-sm tracking-wider">買取・寄付の仕組み</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* 買取セクション */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 flex items-center justify-center bg-orange-500 rounded-xl">
                <i className="ri-shopping-bag-3-line text-2xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold">買取の流れ</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black text-white rounded-full font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2 text-lg">申し込み</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">オンラインフォームから簡単申し込み。犬服の写真を撮って送るだけで査定スタート</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black text-white rounded-full font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2 text-lg">発送</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">無料の配送キットをお届け。犬服を梱包して送るだけで完了</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black text-white rounded-full font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2 text-lg">査定・選択</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">査定後、<strong>入金</strong>または<strong>全額寄付</strong>を選択可能</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black text-white rounded-full font-bold text-lg">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2 text-lg">入金 or 寄付</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">入金なら最短3日で口座へ。寄付なら全額が動物保護団体へ</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">査定料・送料</span>
                <span className="font-bold text-orange-500 text-lg">完全無料</span>
              </div>
            </div>
          </div>

          {/* 寄付の仕組みセクション */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-md border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 flex items-center justify-center bg-orange-500 rounded-xl">
                <i className="ri-heart-3-line text-2xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold">寄付の仕組み</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-full font-bold text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-lg pt-1">売主からの直接寄付</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed ml-11">
                  買取時に「寄付する」を選択すると、買取金額の<strong>全額</strong>を動物保護NPOへ寄付します。
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-full font-bold text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-lg pt-1">販売収益からの寄付</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed ml-11">
                  犬服が販売された際、販売価格の<strong>5%</strong>を自動的にNPOへ寄付します。
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-6 mt-4">
                <div className="flex items-start gap-3">
                  <i className="ri-information-line text-orange-600 text-xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <h4 className="font-bold mb-2 text-sm">透明性の確保</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      寄付実績は定期的に公開。あなたの選択が、確実に動物保護活動を支えます。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-300">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">寄付による貢献</span>
                <span className="font-bold text-orange-500 text-lg">社会貢献</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigate('/system')}
            className="inline-block px-8 py-4 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer rounded-lg"
          >
            詳しい仕組みを見る
          </button>
        </div>
      </div>
    </section>
  );
}
