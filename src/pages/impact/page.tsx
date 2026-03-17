import Navigation from '../home/components/Navigation';
import ImpactSection from '../home/components/ImpactSection';
import Footer from '../home/components/Footer';

const IMPACT_AREAS = [
  {
    icon: 'ri-leaf-line',
    title: '環境保護',
    description: 'ファッション産業のCO2排出量削減に貢献',
    stats: '8,500kg CO2削減',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    icon: 'ri-heart-line',
    title: '動物保護',
    description: '保護犬・保護猫の命を救う活動を支援',
    stats: '¥2.5M 寄付実績',
    color: 'bg-gray-100 text-gray-800'
  },
  {
    icon: 'ri-recycle-line',
    title: '循環型社会',
    description: '資源の有効活用と廃棄物削減を実現',
    stats: '15,000+ 買取実績',
    color: 'bg-orange-50 text-orange-600'
  }
];

const donations = [
  {
    date: '2024年12月',
    organization: '日本動物福祉協会',
    title: '保護犬シェルター運営支援',
    description: '冬季の暖房費用と医療費の支援を実施しました',
    amount: '¥350,000'
  },
  {
    date: '2024年11月',
    organization: 'ワンライフ保護団体',
    title: '保護犬の医療費支援',
    description: '緊急医療が必要な保護犬の治療費を支援しました',
    amount: '¥280,000'
  },
  {
    date: '2024年10月',
    organization: 'ハッピーテール基金',
    title: '保護施設の設備改善',
    description: '保護犬の生活環境改善のための設備投資を支援しました',
    amount: '¥420,000'
  },
  {
    date: '2024年9月',
    organization: '日本動物福祉協会',
    title: '災害時動物救援活動',
    description: '災害被災地での動物救援活動を支援しました',
    amount: '¥500,000'
  },
  {
    date: '2024年8月',
    organization: 'ワンライフ保護団体',
    title: '保護犬の譲渡会開催支援',
    description: '全国5都市での譲渡会開催費用を支援しました',
    amount: '¥320,000'
  },
  {
    date: '2024年7月',
    organization: 'ハッピーテール基金',
    title: '保護犬の健康診断プログラム',
    description: '保護犬の定期健康診断プログラムを支援しました',
    amount: '¥380,000'
  }
];

const partners = [
  {
    name: '日本動物福祉協会',
    description: '1956年設立。日本最大級の動物保護団体として、全国で保護活動を展開しています。',
    website: 'https://example.com'
  },
  {
    name: 'ワンライフ保護団体',
    description: '保護犬の救済と譲渡活動を中心に、動物福祉の向上に取り組んでいます。',
    website: 'https://example.com'
  },
  {
    name: 'ハッピーテール基金',
    description: '保護動物の医療支援と、飼い主への教育プログラムを提供しています。',
    website: 'https://example.com'
  }
];

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Inspiring%20photograph%20of%20a%20lush%20green%20forest%20with%20sunlight%20filtering%20through%20trees%20symbolizing%20environmental%20conservation%20and%20sustainability%20clean%20natural%20beauty%20with%20soft%20lighting%20professional%20nature%20photography%20for%20eco-friendly%20brand%20message&width=1920&height=600&seq=impacthero2024&orientation=landscape"
            alt="社会的価値"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Our Impact
          </h1>
          <p className="text-lg">社会的価値</p>
        </div>
      </section>

      {/* Impact Areas */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">3つの社会的価値</h2>
            <p className="text-gray-600 text-sm">ReWearが生み出す持続可能な未来</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {IMPACT_AREAS.map((area, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className={`w-20 h-20 flex items-center justify-center ${area.color} rounded-full mx-auto mb-6`}>
                  <i className={`${area.icon} text-4xl`}></i>
                </div>
                <h3 className="text-2xl font-bold mb-3">{area.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{area.description}</p>
                <div className="text-xl font-bold text-orange-600">{area.stats}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="w-full h-96 bg-white rounded-2xl overflow-hidden">
              <img 
                src="https://readdy.ai/api/search-image?query=Clean%20infographic%20style%20illustration%20showing%20environmental%20impact%20reduction%20with%20minimalist%20design%20featuring%20recycling%20symbols%20green%20leaves%20and%20CO2%20reduction%20icons%20on%20white%20background%20professional%20vector%20art%20style%20for%20sustainability%20report&width=600&height=600&seq=envimpact2024&orientation=squarish"
                alt="環境への影響"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-6">環境への貢献</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                ファッション産業は世界で2番目に環境負荷の高い産業と言われています。
                犬服のリユースは、新品製造に伴うCO2排出量を削減し、
                廃棄物を減らすことで、地球環境の保護に貢献します。
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600 rounded-lg font-bold text-xl">
                    8.5t
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">CO2削減量</h4>
                    <p className="text-sm text-gray-600">新品製造と比較した削減効果</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600 rounded-lg font-bold text-xl">
                    15k
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">リユース実績</h4>
                    <p className="text-sm text-gray-600">廃棄を防いだ犬服の数</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600 rounded-lg font-bold text-xl">
                    95%
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">資源削減率</h4>
                    <p className="text-sm text-gray-600">水・エネルギー使用量の削減</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation History */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">寄付実績</h2>
            <p className="text-gray-600 text-sm">動物保護団体への支援履歴</p>
          </div>

          <div className="space-y-6">
            {donations.map((donation, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500">{donation.date}</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full whitespace-nowrap">
                      {donation.organization}
                    </span>
                  </div>
                  <h3 className="font-bold mb-1">{donation.title}</h3>
                  <p className="text-sm text-gray-600">{donation.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{donation.amount}</div>
                  <div className="text-xs text-gray-500">寄付金額</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Organizations */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">パートナー団体</h2>
            <p className="text-gray-600 text-sm">共に活動する動物保護団体</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white rounded-xl p-8 text-center">
                <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                  <i className="ri-building-line text-3xl text-gray-600"></i>
                </div>
                <h3 className="font-bold mb-2">{partner.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{partner.description}</p>
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline cursor-pointer">
                  ウェブサイト <i className="ri-external-link-line"></i>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            一緒に未来を変えませんか？
          </h2>
          <p className="text-gray-600 mb-8">
            あなたの選択が、環境と動物たちの未来を守ります
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/#products" className="px-8 py-4 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer">
              商品を見る
            </a>
            <a href="/system" className="px-8 py-4 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap cursor-pointer">
              買取を申し込む
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
