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

const serif = { fontFamily: "'Playfair Display', serif" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="About Us - RePawについて" description="RePawのミッションとブランドストーリー。犬服のリユースで環境保護と動物保護を支援します。" path="/about" />
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-96 md:h-[28rem] flex items-center justify-center overflow-hidden bg-orange-950">

        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={serif}>About Us</h1>
          <p className="text-lg md:text-xl">RePawについて</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>Who We Are</p>
            <h2 className="text-4xl md:text-5xl font-bold">RePawとは</h2>
          </div>
          <p className="text-center text-2xl md:text-3xl font-bold leading-relaxed mb-10">
            犬服の<span className="text-orange-600">リユースEC</span>です。
          </p>
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-base md:text-lg leading-loose text-gray-700">
              愛犬がサイズアウトした服、着せる機会がなかった服、旅立った子が残した服——そういった服を買取り、新しいオーナーへ届けます。
            </p>
            <p className="text-base md:text-lg leading-loose text-gray-700">
              そして商品が売れるたびに、売上の一部を<strong className="font-bold text-gray-900">動物保護団体へ寄付</strong>します。服を循環させることが、そのまま保護犬・保護猫への支援になる。RePawはその仕組みをシンプルに実現するプラットフォームです。
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 px-6 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 md:mb-16">
            <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>Our Values</p>
            <h2 className="text-4xl md:text-5xl font-bold">大切にしていること</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {VALUES.map((value, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 border border-orange-100">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full flex-shrink-0">
                    <i className={`${value.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-xl font-bold leading-snug">{value.title}</h3>
                </div>
                <p className="text-base leading-relaxed text-gray-700">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>Our Story</p>
            <h2 className="text-4xl md:text-5xl font-bold">なぜ、犬服のリユースなのか</h2>
          </div>

          <div className="max-w-3xl mx-auto mb-16 md:mb-24">
            <div className="space-y-6">
              <p className="text-base md:text-lg leading-loose text-gray-700">
                犬を飼っていると、服が余ります。子犬のうちに買ったけどすぐサイズアウトした服、プレゼントでもらったけど好みじゃなかった服、愛犬が旅立ってクローゼットに残ってしまった服。
              </p>
              <p className="text-base md:text-lg leading-loose text-gray-700">
                捨てるには惜しい。でも売る手間もかかる。そのまま引き出しの奥へ——そんな経験をした飼い主さんは多いはずです。
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <p className="text-base md:text-lg leading-loose text-gray-700">
                一方で「保護犬を助けたい」という気持ちはあっても、日常の中で継続的に支援できている人はまだ少ない。特別なアクションを起こさないといけない、という心理的なハードルがあります。
              </p>
              <p className="text-base md:text-lg leading-loose text-gray-700">
                その2つをつなごうと思いました。<strong className="font-bold text-gray-900">服を手放す人</strong>と<strong className="font-bold text-gray-900">服を必要としている人</strong>をつなぎ、その取引の中に<strong className="font-bold text-gray-900">動物保護への寄付</strong>を組み込む。それが<strong className="font-bold text-gray-900">RePaw</strong>の出発点です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-6 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            あなたの服を、次の子へ。
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-orange-50 mb-2">
            眠っている犬服があれば、RePawで次のオーナーへつなぎましょう。
          </p>
          <p className="text-sm md:text-base text-orange-100 mb-10">
            売れるたびに、保護犬・保護猫への支援になります。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/products" className="px-8 py-4 bg-white text-orange-600 rounded-full text-sm md:text-base font-bold hover:bg-orange-50 transition-colors whitespace-nowrap cursor-pointer">
              商品を見る
            </a>
            <a href="/buyback" className="px-8 py-4 border-2 border-white text-white rounded-full text-sm md:text-base font-bold hover:bg-white hover:text-orange-600 transition-colors whitespace-nowrap cursor-pointer">
              買取を申し込む
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
