import { Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import StitchedImage from '../../components/StitchedImage';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const IMPACTS = [
  {
    eyebrow: 'Environment',
    icon: 'ri-leaf-line',
    title: '環境への配慮',
    description: 'まだ使える犬服が毎年大量に捨てられています。リユースすることで、新品をつくるために必要な水・エネルギー・素材の消費を減らすことができます。捨てる前に、次の誰かへ。その積み重ねが環境への負荷を減らしていきます。',
    image: 'https://readdy.ai/api/search-image?query=Sunlight%20filtering%20through%20green%20forest%20leaves%20environmental%20conservation%20fresh%20natural%20light%20editorial%20nature%20photography&width=900&height=700&seq=impactenv2026&orientation=landscape',
    imageAlt: '木漏れ日の差す森',
  },
  {
    eyebrow: 'For Animals',
    icon: 'ri-heart-line',
    title: '動物保護への支援',
    description: 'RePawでの売上の一部は、保護犬・保護猫の支援活動を行う団体への寄付にあてています。服を買う・売るという日常の行動が、保護施設で暮らす動物たちの医療費や生活環境の改善につながっています。',
    image: 'https://readdy.ai/api/search-image?query=Volunteer%20gently%20holding%20small%20rescued%20dog%20in%20bright%20animal%20shelter%20warm%20hopeful%20atmosphere%20editorial%20photography&width=900&height=700&seq=impactanimal2026&orientation=landscape',
    imageAlt: '保護犬を抱くボランティア',
  },
  {
    eyebrow: 'Culture',
    icon: 'ri-refresh-line',
    title: 'ものを大切にする文化',
    description: '「気に入って買ったけど、うちの子には合わなかった」という経験、ありませんか。良いものを長く、次の子へつなぐ。そういう選択肢がもっと当たり前になってほしいと思っています。',
    image: 'https://readdy.ai/api/search-image?query=Hands%20folding%20small%20second%20hand%20dog%20clothes%20with%20care%20on%20wooden%20table%20warm%20light%20editorial%20photography&width=900&height=700&seq=impactculture2026&orientation=landscape',
    imageAlt: '犬服を丁寧にたたむ手元',
  },
];

const DONATION_STEPS = [
  {
    number: '1',
    title: '商品を購入・売却する',
    description: 'RePawで犬服を買う・売るだけでOK。特別な手続きは必要ありません。',
  },
  {
    number: '2',
    title: '売上の一部を寄付',
    description: 'RePawは売上の一部を動物保護団体への寄付にあてています。',
  },
  {
    number: '3',
    title: '保護犬・保護猫の支援へ',
    description: '寄付は医療費・生活環境の改善など、保護施設での活動に役立てられます。',
  },
];

const serif = { fontFamily: "'Playfair Display', serif" };

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="社会への取り組み" description="RePawの環境保護・動物保護支援への取り組みをご紹介します。犬服のリユースが社会貢献につながる仕組みです。" path="/impact" />
      <Navigation />

      {/* Hero */}
      <section className="relative h-96 md:h-[28rem] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Inspiring%20photograph%20of%20a%20lush%20green%20forest%20with%20sunlight%20filtering%20through%20trees%20symbolizing%20environmental%20conservation%20and%20sustainability%20clean%20natural%20beauty%20with%20soft%20lighting%20professional%20nature%20photography%20for%20eco-friendly%20brand%20message&width=1920&height=600&seq=impacthero2024&orientation=landscape"
            alt="社会への取り組み"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-orange-950/50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={serif}>Our Impact</h1>
          <p className="text-lg md:text-xl">RePawの社会への取り組み</p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>Why RePaw</p>
          <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-8">
            服を売り買いすることが、
            <br className="hidden md:block" />
            社会への貢献になる
          </h2>
          <p className="text-base md:text-lg leading-loose text-gray-700 text-left md:text-center">
            RePawは、犬服のリユースを通じて「環境」と「動物保護」という2つの課題に取り組んでいます。特別なことをしなくても、日常の買い物のなかで社会に貢献できる仕組みをつくりたい。それがRePawを始めた理由のひとつです。
          </p>
        </div>
      </section>

      {/* 3 Impact Areas — マガジン風交互レイアウト */}
      <section className="py-20 md:py-28 px-6 bg-orange-50">
        <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
          {IMPACTS.map((item, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              <StitchedImage
                src={item.image}
                alt={item.imageAlt}
                className={`aspect-[9/7] w-full ${index % 2 === 1 ? 'md:order-2' : ''}`}
                tilt={index % 2 === 1 ? 'right' : 'left'}
              />
              <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>{item.eyebrow}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full flex-shrink-0">
                    <i className={`${item.icon} text-xl`}></i>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">{item.title}</h3>
                </div>
                <p className="text-base md:text-lg leading-loose text-gray-700">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 寄付の仕組み */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">寄付の仕組み</h2>
            <p className="text-base md:text-lg text-gray-600">RePawでのお買い物が、そのまま支援につながります</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-10 md:gap-8">
            {/* 縫い目のつなぎ線（PC） */}
            <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] border-t-2 border-dashed border-orange-300" aria-hidden="true"></div>
            {DONATION_STEPS.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-14 h-14 flex items-center justify-center bg-orange-600 text-white rounded-full mx-auto mb-5 text-xl font-bold relative z-10">
                  {step.number}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-base leading-relaxed text-gray-700">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">あなたの選択が、誰かの力になる</h2>
          <p className="text-base md:text-lg leading-relaxed text-orange-50 mb-10">
            使わなくなった犬服を手放すだけで、環境にも動物にも優しい選択になります。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="px-8 py-4 bg-white text-orange-600 rounded-full text-sm md:text-base font-bold hover:bg-orange-50 transition-colors whitespace-nowrap">
              商品を見る
            </Link>
            <Link to="/buyback" className="px-8 py-4 border-2 border-white text-white rounded-full text-sm md:text-base font-bold hover:bg-white hover:text-orange-600 transition-colors whitespace-nowrap">
              買取を申し込む
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
