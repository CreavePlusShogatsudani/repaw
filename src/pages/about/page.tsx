import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const VALUES = [
  {
    icon: 'ri-recycle-line',
    title: 'サステナビリティ',
    description: '犬服をリユースすることで、まだ使えるものを捨てない文化をつくっていきたいと思っています。小さな選択が、環境への大きな一歩になると信じています。'
  },
  {
    icon: 'ri-heart-line',
    title: '動物愛護',
    description: '売上の一部は動物保護団体への寄付にあてています。服を売り買いするだけで、保護犬・保護猫の支援につながる仕組みです。'
  },
  {
    icon: 'ri-team-line',
    title: 'コミュニティ',
    description: '犬を愛する人同士がつながれる場所でありたい。使わなくなった服を、大切にしてくれる次の飼い主へ。そんな循環を一緒につくっていければと思っています。'
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
            alt="About RePaw"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>

        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Us</h1>
          <p className="text-lg font-light">RePawについて</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">私たちのミッション</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light">
            犬服のリユースを通じて、<br />
            <strong className="text-orange-600 font-bold">環境</strong>と<strong className="text-orange-600 font-bold">動物</strong>、どちらにも優しい選択肢をつくる。
          </p>
          <p className="text-gray-600 text-sm leading-relaxed font-light">
            使わなくなった犬服を次の飼い主へつなぐことで、まだ使えるものが捨てられる現状を変えたい。<br />
            そして、その売上の一部を動物保護団体に寄付することで、<br />
            保護犬・保護猫の支援にもつなげていきたいと考えています。
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">大切にしていること</h2>
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
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 text-lg">RePaw誕生のきっかけ</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-10">
            <div className="space-y-6">
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                日本では毎年、大量の犬服が捨てられています。サイズが合わなくなった、デザインに飽きた、愛犬が亡くなった——理由はさまざまですが、まだ十分に使える服が廃棄されているのが現実です。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                一方で、保護犬たちには医療費や食費など、継続的な支援が必要です。でも「何か力になりたい」と思っていても、日常の中でできることは限られていると感じる方も多いのではないでしょうか。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                そんな2つの課題をつなげられないか、という考えから<strong className="font-bold">RePaw</strong>は生まれました。犬服を売る・買うという普通のことが、環境への配慮にも、動物への支援にもなる。そういう仕組みをつくりたいと思っています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            一緒に取り組んでみませんか？
          </h2>
          <p className="text-gray-600 mb-8 font-light">
            使わなくなった犬服があれば、ぜひRePawへ。
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
