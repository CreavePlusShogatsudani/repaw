import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import ProductMosaic from '../../components/ProductMosaic';
import CtaBand from '../../components/CtaBand';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { DONATION_RATE_LABEL } from '../../lib/donation';

const IMPACTS = [
  {
    title: '環境への配慮',
    description: 'まだ使える犬服が毎年大量に捨てられています。リユースすることで、新品をつくるために必要な水・エネルギー・素材の消費を減らすことができます。捨てる前に、次の誰かへ。その積み重ねが環境への負荷を減らしていきます。',
  },
  {
    title: '動物保護への支援',
    description: 'RePawでの売上の一部は、保護犬・保護猫の支援活動を行う団体への寄付にあてています。服を買う・売るという日常の行動が、保護施設で暮らす動物たちの医療費や生活環境の改善につながっています。',
  },
  {
    title: 'ものを大切にする文化',
    description: '「気に入って買ったけど、うちの子には合わなかった」という経験、ありませんか。良いものを長く、次の子へつなぐ。そういう選択肢がもっと当たり前になってほしいと思っています。',
  },
];

const DONATION_STEPS = [
  {
    title: '商品を購入・売却する',
    description: 'RePawで犬服を買う・売るだけでOK。特別な手続きは必要ありません。',
  },
  {
    title: '売上の一部を寄付',
    description: 'RePawは売上の一部を動物保護団体への寄付にあてています。',
  },
  {
    title: '保護犬・保護猫の支援へ',
    description: '寄付は医療費・生活環境の改善など、保護施設での活動に役立てられます。',
  },
];

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="社会への取り組み" description="RePawの環境保護・動物保護支援への取り組みをご紹介します。犬服のリユースが社会貢献につながる仕組みです。" path="/impact" />
      <Navigation />

      <main className="page">
        <div className="shop-container">
          <PageHeader eyebrow="Impact" title="社会への取り組み" lead="犬服のリユースを通じて「環境」と「動物保護」という2つの課題に取り組んでいます。" />
        </div>

        {/* 宣言 */}
        <section className="page-section !pt-6">
          <div className="shop-container">
            <p className="rp-manifesto">
              服を売り買いすることが、<br className="hidden md:block" /><strong>社会への貢献になる。</strong>
            </p>
            <div className="rp-prose mt-12 mx-auto text-center">
              <p>特別なことをしなくても、日常の買い物のなかで社会に貢献できる仕組みをつくりたい。それがRePawを始めた理由のひとつです。</p>
            </div>
          </div>
        </section>

        {/* 数字 */}
        <div className="shop-container">
          <div className="rp-stats">
            <div><p className="rp-stat-num">{DONATION_RATE_LABEL}</p><p className="rp-stat-label">販売価格から動物保護団体へ寄付</p></div>
            <div><p className="rp-stat-num">2<small>つ</small></p><p className="rp-stat-label">寄付のルート。買取時と販売時</p></div>
            <div><p className="rp-stat-num">100<small>%</small></p><p className="rp-stat-label">寄付を選んだ買取額は全額を寄付</p></div>
          </div>
        </div>

        {/* 3つの取り組み */}
        <section className="page-section">
          <div className="shop-container">
            <div className="page-section-center">
              <p className="shop-eyebrow">Our Focus</p>
              <h2>3つの取り組み</h2>
            </div>
            <div className="rp-numbered mt-16">
              {IMPACTS.map((item, i) => (
                <div key={item.title}>
                  <span className="rp-num">0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductMosaic />

        {/* 寄付の仕組み */}
        <section className="rp-band">
          <div className="shop-container">
            <div className="rp-split rp-split-reverse">
              <figure className="rp-figure">
                <img src="/images/repaw-dog.jpg" alt="ハーネスを着て飼い主の膝に座るトイプードル" loading="lazy" />
              </figure>
              <div>
                <p className="shop-eyebrow">How It Works</p>
                <h2 className="text-[32px] font-medium tracking-[.1em] leading-snug">寄付の仕組み</h2>
                <p className="page-section-lead">RePawでのお買い物が、そのまま支援につながります。</p>
                <div className="mt-10 space-y-8">
                  {DONATION_STEPS.map((step, i) => (
                    <div key={step.title} className="grid grid-cols-[56px_1fr] gap-4">
                      <span className="font-['Playfair_Display'] italic text-[28px] leading-none text-[color:var(--rp-ink)]">0{i + 1}</span>
                      <div>
                        <h3 className="text-[18px] font-medium tracking-[.04em]">{step.title}</h3>
                        <p className="mt-3 text-[14px] leading-8 text-[color:var(--rp-text)]">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <CtaBand
          title="あなたの選択が、誰かの力になる。"
          text="使わなくなった犬服を手放すだけで、環境にも動物にも優しい選択になります。"
          primary={{ to: '/products', label: '犬服を探す' }}
          secondary={{ to: '/buyback', label: '買取を申し込む' }}
        />
      </main>

      <Footer />
    </div>
  );
}
