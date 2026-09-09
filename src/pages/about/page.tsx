import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import ProductMosaic from '../../components/ProductMosaic';
import CtaBand from '../../components/CtaBand';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const VALUES = [
  {
    title: 'もったいないをなくす',
    description: 'サイズアウト、飽き、お別れ。理由はさまざまでも、まだ着られる服が毎日捨てられています。RePawは「次の子に着てもらう」という選択肢をつくります。'
  },
  {
    title: '買うだけで支援になる',
    description: '商品が売れるたびに、売上の一部が動物保護団体へ届きます。特別なことをしなくていい。好きな服を選ぶだけで、保護犬・保護猫の医療費や食費を支えられます。'
  },
  {
    title: '前のオーナーが見える',
    description: '商品ページには元のオーナーのInstagramアカウントを掲載しています。どんな子が着ていたか、どんな人が大切にしていたか。その背景ごと、次の子へ受け継ぎます。'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="About Us - RePawについて" description="RePawのミッションとブランドストーリー。犬服のリユースで環境保護と動物保護を支援します。" path="/about" />
      <Navigation />

      <main className="page">
        <div className="shop-container">
          <PageHeader eyebrow="About" title="RePawについて" lead="犬服のリユースECです。服を循環させることが、そのまま保護犬・保護猫への支援になります。" />
        </div>

        {/* 実写の帯: お店の空気 */}
        <ProductMosaic />

        {/* 宣言 */}
        <section className="page-section">
          <div className="shop-container">
            <p className="shop-eyebrow text-center">Who We Are</p>
            <p className="rp-manifesto mt-6">
              愛犬がサイズアウトした服、着せる機会がなかった服、旅立った子が残した服。<br className="hidden md:block" />
              そういった服を買い取り、<strong>新しいオーナーへ届けます。</strong>
            </p>
            <div className="rp-prose max-w-[36em] mx-auto mt-12">
              <p>そして商品が売れるたびに、売上の一部を動物保護団体へ寄付します。服を循環させることが、そのまま保護犬・保護猫への支援になる。RePawはその仕組みをシンプルに実現するプラットフォームです。</p>
            </div>
          </div>
        </section>

        {/* 大切にしていること: 写真 + 番号付きの3項目 */}
        <section className="rp-band">
          <div className="shop-container">
            <div className="rp-split">
              <figure className="rp-figure">
                <img src="/images/repaw-dog.jpg" alt="ハーネスを着て飼い主の膝に座るトイプードル" loading="lazy" />
              </figure>
              <div>
                <p className="shop-eyebrow">Our Values</p>
                <h2 className="text-[32px] font-medium tracking-[.1em] leading-snug">大切にしていること</h2>
                <div className="mt-10 space-y-8">
                  {VALUES.map((value, i) => (
                    <div key={value.title} className="grid grid-cols-[56px_1fr] gap-4">
                      <span className="rp-num font-['Playfair_Display'] italic text-[28px] leading-none text-[color:var(--rp-ink)]">0{i + 1}</span>
                      <div>
                        <h3 className="text-[18px] font-medium tracking-[.04em]">{value.title}</h3>
                        <p className="mt-3 text-[14px] leading-8 text-[color:var(--rp-text)]">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story: 2 カラムの読みもの */}
        <section className="page-section">
          <div className="shop-container">
            <div className="page-section-center">
              <p className="shop-eyebrow">Our Story</p>
              <h2>なぜ、犬服のリユースなのか</h2>
            </div>
            {/* 日本語の長文は左右に分けず、読み幅 36em の 1 カラムで読ませる */}
            <div className="rp-prose max-w-[36em] mx-auto mt-14">
              <p>犬を飼っていると、服が余ります。子犬のうちに買ったけどすぐサイズアウトした服、プレゼントでもらったけど好みじゃなかった服、愛犬が旅立ってクローゼットに残ってしまった服。</p>
              <p>捨てるには惜しい。でも売る手間もかかる。そのまま引き出しの奥へ。そんな経験をした飼い主さんは多いはずです。</p>
              <p>一方で「保護犬を助けたい」という気持ちはあっても、日常の中で継続的に支援できている人はまだ少ない。特別なアクションを起こさないといけない、という心理的なハードルがあります。</p>
              <p>その2つをつなごうと思いました。<strong>服を手放す人</strong>と<strong>服を必要としている人</strong>をつなぎ、その取引の中に<strong>動物保護への寄付</strong>を組み込む。それが<strong>RePaw</strong>の出発点です。</p>
            </div>
          </div>
        </section>

        <CtaBand
          title="あなたの服を、次の子へ。"
          text="眠っている犬服があれば、RePawで次のオーナーへつなぎましょう。売れるたびに、保護犬・保護猫への支援になります。"
          primary={{ to: '/products', label: '犬服を探す' }}
          secondary={{ to: '/buyback', label: '買取を申し込む' }}
        />
      </main>

      <Footer />
    </div>
  );
}
