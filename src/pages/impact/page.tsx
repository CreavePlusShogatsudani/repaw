import { Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const IMPACTS = [
  {
    icon: 'ri-leaf-line',
    title: '環境への配慮',
    description: 'まだ使える犬服が毎年大量に捨てられています。リユースすることで、新品をつくるために必要な水・エネルギー・素材の消費を減らすことができます。捨てる前に、次の誰かへ。その積み重ねが環境への負荷を減らしていきます。',
  },
  {
    icon: 'ri-heart-line',
    title: '動物保護への支援',
    description: 'RePawでの売上の一部は、保護犬・保護猫の支援活動を行う団体への寄付にあてています。服を買う・売るという日常の行動が、保護施設で暮らす動物たちの医療費や生活環境の改善につながっています。',
  },
  {
    icon: 'ri-refresh-line',
    title: 'ものを大切にする文化',
    description: '「気に入って買ったけど、うちの子には合わなかった」という経験、ありませんか。良いものを長く、次の子へつなぐ。そういう選択肢がもっと当たり前になってほしいと思っています。',
  },
];

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="社会への取り組み" description="RePawの環境保護・動物保護支援への取り組みをご紹介します。犬服のリユースが社会貢献につながる仕組みです。" path="/impact" />
      <Navigation />

      {/* Hero */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Inspiring%20photograph%20of%20a%20lush%20green%20forest%20with%20sunlight%20filtering%20through%20trees%20symbolizing%20environmental%20conservation%20and%20sustainability%20clean%20natural%20beauty%20with%20soft%20lighting%20professional%20nature%20photography%20for%20eco-friendly%20brand%20message&width=1920&height=600&seq=impacthero2024&orientation=landscape"
            alt="社会への取り組み"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Our Impact</h1>
          <p className="text-lg font-light">RePawの社会への取り組み</p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">服を売り買いすることが、社会への貢献になる</h2>
          <p className="text-gray-600 leading-relaxed">
            RePawは、犬服のリユースを通じて「環境」と「動物保護」という2つの課題に取り組んでいます。特別なことをしなくても、日常の買い物のなかで社会に貢献できる仕組みをつくりたい。それがRePawを始めた理由のひとつです。
          </p>
        </div>
      </section>

      {/* 3 Impact Areas */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {IMPACTS.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-8">
                <div className="w-14 h-14 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full mb-6">
                  <i className={`${item.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 寄付の仕組み */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">寄付の仕組み</h2>
          <p className="text-center text-gray-600 mb-16">RePawでのお買い物が、そのまま支援につながります</p>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="font-bold mb-2">商品を購入・売却する</h3>
              <p className="text-sm text-gray-600">RePawで犬服を買う・売るだけでOK。特別な手続きは必要ありません。</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="font-bold mb-2">売上の一部を寄付</h3>
              <p className="text-sm text-gray-600">RePawは売上の一部を動物保護団体への寄付にあてています。</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="font-bold mb-2">保護犬・保護猫の支援へ</h3>
              <p className="text-sm text-gray-600">寄付は医療費・生活環境の改善など、保護施設での活動に役立てられます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">あなたの選択が、誰かの力になる</h2>
          <p className="text-gray-600 mb-8">
            使わなくなった犬服を手放すだけで、環境にも動物にも優しい選択になります。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="px-8 py-4 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
              商品を見る
            </Link>
            <Link to="/buyback" className="px-8 py-4 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap">
              買取を申し込む
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
