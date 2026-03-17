import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const VALUES = [
  {
    icon: 'ri-recycle-line',
    title: 'サステナビリティ',
    description: '犬服のリユースを通じて、ファッション産業の環境負荷を削減し、循環型社会の実現に貢献します。'
  },
  {
    icon: 'ri-heart-line',
    title: '動物愛護',
    description: '買取・販売収益の一部を動物保護団体へ寄付し、保護犬・保護猫の命を救う活動を支援します。'
  },
  {
    icon: 'ri-team-line',
    title: 'コミュニティ',
    description: 'ペットを愛する人々が繋がり、共に社会貢献できるプラットフォームを提供します。'
  }
];

const TIMELINE = [
  {
    year: '2022年4月',
    title: 'RePow設立',
    description: '犬服リユースプラットフォームとしてサービス開始'
  },
  {
    year: '2022年8月',
    title: '初の寄付実施',
    description: '動物保護団体へ初めての寄付を実施（50万円）'
  },
  {
    year: '2023年3月',
    title: '取扱商品1万点突破',
    description: 'リユース商品の取扱数が1万点を超える'
  },
  {
    year: '2023年9月',
    title: 'パートナー団体拡大',
    description: '提携する動物保護団体が全国10団体に'
  },
  {
    year: '2024年1月',
    title: '累計寄付額250万円達成',
    description: 'サービス開始から累計250万円の寄付を達成'
  }
];

const TEAM_MEMBERS = [
  {
    name: '山田 太郎',
    position: '代表取締役',
    description: '大手アパレル企業での経験を活かし、サステナブルなファッションビジネスを展開。',
    imageUrl: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20photograph%20of%20confident%20Japanese%20male%20business%20executive%20in%20his%20thirties%20wearing%20modern%20casual%20business%20attire%20against%20clean%20white%20background%20natural%20lighting%20warm%20friendly%20expression%20for%20company%20about%20page&width=400&height=400&seq=ceo2024repow&orientation=squarish'
  },
  {
    name: '佐藤 花子',
    position: 'COO',
    description: '動物保護活動の経験を持ち、NPO団体との連携を推進。社会貢献活動を統括。',
    imageUrl: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20photograph%20of%20confident%20Japanese%20female%20business%20executive%20in%20her%20thirties%20wearing%20modern%20casual%20business%20attire%20against%20clean%20white%20background%20natural%20lighting%20warm%20friendly%20expression%20for%20company%20about%20page&width=400&height=400&seq=coo2024repow&orientation=squarish'
  },
  {
    name: '鈴木 健一',
    position: 'CTO',
    description: 'テクノロジーを活用したプラットフォーム開発を担当。ユーザー体験の向上に注力。',
    imageUrl: 'https://readdy.ai/api/search-image?query=Professional%20portrait%20photograph%20of%20confident%20Japanese%20male%20technology%20executive%20in%20his%20thirties%20wearing%20modern%20casual%20business%20attire%20against%20clean%20white%20background%20natural%20lighting%20warm%20friendly%20expression%20for%20company%20about%20page&width=400&height=400&seq=cto2024repow&orientation=squarish'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-['Noto_Sans_JP']">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Inspiring%20photograph%20of%20diverse%20group%20of%20happy%20dogs%20of%20different%20breeds%20sitting%20together%20in%20a%20bright%20modern%20space%20with%20natural%20lighting%20and%20minimalist%20white%20interior%20design%20symbolizing%20community%20unity%20and%20animal%20welfare%20professional%20photography%20for%20pet%20business%20about%20page&width=1920&height=1080&seq=abouthero2024repow&orientation=landscape"
            alt="About RePow"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            About Us
          </h1>
          <p className="text-lg font-light">RePowについて</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">私たちのミッション</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light">
            RePowは、犬服のリユースを通じて<br />
            <strong className="text-orange-600 font-bold">環境保護</strong>と<strong className="text-orange-600 font-bold">動物保護</strong>を同時に実現する<br />
            新しいエコシステムを創造します。
          </p>
          <p className="text-gray-600 text-sm leading-relaxed font-light">
            ペットを愛する人々が、使わなくなった犬服を次の飼い主へ繋ぐことで、<br />
            資源の有効活用と廃棄物削減を実現。さらに、買取・販売収益の一部を<br />
            動物保護団体へ寄付することで、保護犬・保護猫の命を救う活動を支援しています。
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">私たちの価値観</h2>
            <p className="text-gray-600 text-sm font-light">RePowが大切にしていること</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center">
                <div className="w-20 h-20 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full mx-auto mb-6">
                  <i className={`${value.icon} text-4xl`}></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 text-lg">RePow誕生の背景</p>
          </div>

          <div className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="space-y-6">
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                日本では毎年、大量の犬服が廃棄されています。サイズが合わなくなった、デザインに飽きた、愛犬が亡くなった...様々な理由で、まだ使える犬服が捨てられているのです。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                一方で、保護犬や野良犬たちは、寒さや雨から身を守る服を必要としています。また、新しい飼い主を待つ保護犬たちには、医療費や食費などの支援が必要です。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                そんな想いから、犬服のリユースと動物保護支援を組み合わせた<strong className="font-bold">RePow</strong>が誕生しました。環境保護と動物保護、2つの社会課題を同時に解決する新しいビジネスモデルとして、多くの方々に支持されています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">数字で見るRePow</h2>
            <p className="text-gray-400 text-sm font-light">私たちの実績</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500 mb-2">15,000+</div>
              <p className="text-sm text-gray-400 font-light">リユース実績</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500 mb-2">¥2.5M</div>
              <p className="text-sm text-gray-400 font-light">累計寄付額</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500 mb-2">8.5t</div>
              <p className="text-sm text-gray-400 font-light">CO2削減量</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500 mb-2">10</div>
              <p className="text-sm text-gray-400 font-light">提携NPO団体</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            一緒に未来を変えませんか？
          </h2>
          <p className="text-gray-600 mb-8 font-light">
            RePowのミッションに共感いただける方、ぜひご参加ください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/#items" className="px-8 py-4 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer">
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
