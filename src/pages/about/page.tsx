import PageMeta from '../../components/PageMeta';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const VALUES = [
  {
    icon: 'ri-recycle-line',
    title: 'もったいないをなくす',
    description: 'サイズアウト、飽き、お別れ——理由はさまざまでも、まだ着られる服が毎日捨てられています。RePawは「次の子に着てもらう」という選択肢をつくります。'
  },
  {
    icon: 'ri-heart-line',
    title: '買うだけで支援になる',
    description: '商品が売れるたびに、売上の一部が動物保護団体へ届きます。特別なことをしなくていい。好きな服を選ぶだけで、保護犬・保護猫の医療費や食費を支えられます。'
  },
  {
    icon: 'ri-instagram-line',
    title: '前のオーナーが見える',
    description: '商品ページには元のオーナーのInstagramアカウントを掲載しています。どんな子が着ていたか、どんな人が大切にしていたか。その背景ごと、次の子へ受け継ぎます。'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-['Noto_Sans_JP']">
      <PageMeta title="About Us - RePawについて" description="RePawのミッションとブランドストーリー。犬服のリユースで環境保護と動物保護を支援します。" path="/about" />
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Inspiring%20photograph%20of%20diverse%20group%20of%20happy%20dogs%20of%20different%20breeds%20sitting%20together%20in%20a%20bright%20modern%20space%20with%20natural%20lighting%20and%20minimalist%20white%20interior%20design%20symbolizing%20community%20unity%20and%20animal%20welfare%20professional%20photography%20for%20pet%20business%20about%20page&width=1920&height=1080&seq=abouthero2024repow&orientation=landscape"
            alt="About RePaw"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>

        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>About Us</h1>
          <p className="text-lg font-light">RePawについて</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">RePawとは</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6 font-light">
            犬服の<strong className="text-orange-600 font-bold">リユースEC</strong>です。
          </p>
          <p className="text-gray-600 text-sm leading-relaxed font-light mb-6">
            愛犬がサイズアウトした服、着せる機会がなかった服、旅立った子が残した服——<br />
            そういった服を買取り、新しいオーナーへ届けます。
          </p>
          <p className="text-gray-600 text-sm leading-relaxed font-light">
            そして商品が売れるたびに、売上の一部を<strong className="font-bold text-gray-800">動物保護団体へ寄付</strong>します。<br />
            服を循環させることが、そのまま保護犬・保護猫への支援になる。<br />
            RePawはその仕組みをシンプルに実現するプラットフォームです。
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">大切にしていること</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center">
                <div className="w-20 h-20 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full mx-auto mb-6">
                  <i className={`${value.icon} text-4xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 text-lg font-light">なぜ、犬服のリユースなのか</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-10">
            <div className="space-y-6">
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                犬を飼っていると、服が余ります。子犬のうちに買ったけどすぐサイズアウトした服、プレゼントでもらったけど好みじゃなかった服、愛犬が旅立ってクローゼットに残ってしまった服。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                捨てるには惜しい。でも売る手間もかかる。そのまま引き出しの奥へ——そんな経験をした飼い主さんは多いはずです。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                一方で「保護犬を助けたい」という気持ちはあっても、日常の中で継続的に支援できている人はまだ少ない。特別なアクションを起こさないといけない、という心理的なハードルがあります。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                その2つをつなごうと思いました。<strong className="font-bold text-gray-800">服を手放す人</strong>と<strong className="font-bold text-gray-800">服を必要としている人</strong>をつなぎ、その取引の中に<strong className="font-bold text-gray-800">動物保護への寄付</strong>を組み込む。それが<strong className="font-bold">RePaw</strong>の出発点です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            あなたの服を、次の子へ。
          </h2>
          <p className="text-gray-600 mb-2 font-light">
            眠っている犬服があれば、RePawで次のオーナーへつなぎましょう。
          </p>
          <p className="text-gray-500 text-sm mb-10 font-light">
            売れるたびに、保護犬・保護猫への支援になります。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/products" className="px-8 py-4 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer">
              商品を見る
            </a>
            <a href="/buyback" className="px-8 py-4 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap cursor-pointer">
              買取を申し込む
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
