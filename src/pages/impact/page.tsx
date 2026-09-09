import { Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const IMPACTS = [
  {
    eyebrow: 'Environment',
    icon: 'ri-leaf-line',
    title: '環境への配慮',
    description: 'まだ使える犬服が毎年大量に捨てられています。リユースすることで、新品をつくるために必要な水・エネルギー・素材の消費を減らすことができます。捨てる前に、次の誰かへ。その積み重ねが環境への負荷を減らしていきます。',
  },
  {
    eyebrow: 'For Animals',
    icon: 'ri-heart-line',
    title: '動物保護への支援',
    description: 'RePawでの売上の一部は、保護犬・保護猫の支援活動を行う団体への寄付にあてています。服を買う・売るという日常の行動が、保護施設で暮らす動物たちの医療費や生活環境の改善につながっています。',
  },
  {
    eyebrow: 'Culture',
    icon: 'ri-refresh-line',
    title: 'ものを大切にする文化',
    description: '「気に入って買ったけど、うちの子には合わなかった」という経験、ありませんか。良いものを長く、次の子へつなぐ。そういう選択肢がもっと当たり前になってほしいと思っています。',
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

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="社会への取り組み" description="RePawの環境保護・動物保護支援への取り組みをご紹介します。犬服のリユースが社会貢献につながる仕組みです。" path="/impact" />
      <Navigation />

      <main className="page">
        <div className="shop-container">
          <PageHeader eyebrow="Impact" title="社会への取り組み" lead="犬服のリユースを通じて「環境」と「動物保護」という2つの課題に取り組んでいます。" />

          {/* Intro */}
          <section className="page-section">
            <p className="shop-eyebrow">Why RePaw</p>
            <h2>服を売り買いすることが、社会への貢献になる</h2>
            <div className="rp-prose mt-8">
              <p>
                RePawは、犬服のリユースを通じて「環境」と「動物保護」という2つの課題に取り組んでいます。特別なことをしなくても、日常の買い物のなかで社会に貢献できる仕組みをつくりたい。それがRePawを始めた理由のひとつです。
              </p>
            </div>
          </section>

          {/* 3 Impact Areas */}
          <section className="page-section">
            <p className="shop-eyebrow">Our Focus</p>
            <h2>3つの取り組み</h2>
            <div className="rp-rows mt-10">
              {IMPACTS.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 寄付の仕組み */}
          <section className="page-section">
            <p className="shop-eyebrow">How It Works</p>
            <h2>寄付の仕組み</h2>
            <p className="mt-3 text-sm text-[color:var(--rp-muted)]">RePawでのお買い物が、そのまま支援につながります</p>
            <div className="rp-steps mt-10">
              {DONATION_STEPS.map((step, index) => (
                <div key={step.title}>
                  <span className="rp-num">0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="rp-band page-section">
          <div className="shop-container">
            <h2>あなたの選択が、誰かの力になる</h2>
            <div className="rp-prose mt-6">
              <p>使わなくなった犬服を手放すだけで、環境にも動物にも優しい選択になります。</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/products" className="rp-btn rp-btn-black">犬服を探す</Link>
              <Link to="/buyback" className="rp-btn rp-btn-outline">買取を申し込む</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
