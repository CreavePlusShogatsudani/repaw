import { useNavigate } from 'react-router-dom';

export default function SystemSection() {
  const navigate = useNavigate();

  return (
    <section id="system" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>System</h2>
          <p className="text-gray-600 text-sm tracking-wider">買取・寄付の仕組み</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-2xl">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white rounded-full mb-6">
              <i className="ri-hand-coin-line text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4">買取の流れ</h3>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold mr-4">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">申込み</h4>
                  <p className="text-sm text-gray-600">オンラインフォームから犬服の買取を申込み</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold mr-4">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">発送</h4>
                  <p className="text-sm text-gray-600">無料の宅配キットで犬服を発送</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold mr-4">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">査定</h4>
                  <p className="text-sm text-gray-600">専門スタッフが丁寧に査定</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold mr-4">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">振込 or 寄付</h4>
                  <p className="text-sm text-gray-600">買取金額を振込、または全額寄付を選択</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-10 rounded-2xl">
            <div className="w-16 h-16 flex items-center justify-center bg-green-600 text-white rounded-full mb-6">
              <i className="ri-heart-3-line text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4">寄付の仕組み</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  ルート① 売主からの寄付
                </h4>
                <p className="text-sm text-gray-600 ml-4">
                  買取時に寄付を選択すると、買取金額の全額を動物保護NPOへ寄付します。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  ルート② 販売収益からの寄付
                </h4>
                <p className="text-sm text-gray-600 ml-4">
                  犬服が販売された際、販売収益の一部を自動的にNPOへ寄付します。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg mt-6">
                <h4 className="font-semibold mb-3">透明性の確保</h4>
                <p className="text-sm text-gray-600 mb-4">
                  寄付実績は定期的に公開し、透明性を保ちます。あなたの選択が、確実に動物保護活動を支えます。
                </p>
                <div className="flex items-center text-sm text-green-600 font-medium cursor-pointer hover:underline">
                  寄付実績を見る
                  <i className="ri-arrow-right-line ml-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigate('/buyback')}
            className="px-10 py-4 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            買取を申し込む
          </button>
        </div>
      </div>
    </section>
  );
}
