import { Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const VALUES = [
  {
    icon: 'ri-recycle-line',
    title: 'もったいないをなくす',
    description: 'サイズアウト、飽き、お別れ。理由はさまざまでも、まだ着られる服が毎日捨てられています。RePawは「次の子に着てもらう」という選択肢をつくります。'
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
    <div className="min-h-screen bg-white">
      <PageMeta title="About Us - RePawについて" description="RePawのミッションとブランドストーリー。犬服のリユースで環境保護と動物保護を支援します。" path="/about" />
      <Navigation />

      <main className="page">
        <div className="shop-container">
          <PageHeader eyebrow="About" title="RePawについて" lead="犬服のリユースECです。服を循環させることが、そのまま保護犬・保護猫への支援になります。" />

          {/* Mission */}
          <section className="page-section">
            <p className="shop-eyebrow">Who We Are</p>
            <h2>RePawとは</h2>
            <div className="rp-prose mt-8">
              <p>犬服の<strong>リユースEC</strong>です。</p>
              <p>
                愛犬がサイズアウトした服、着せる機会がなかった服、旅立った子が残した服。そういった服を買取り、新しいオーナーへ届けます。
              </p>
              <p>
                そして商品が売れるたびに、売上の一部を<strong>動物保護団体へ寄付</strong>します。服を循環させることが、そのまま保護犬・保護猫への支援になる。RePawはその仕組みをシンプルに実現するプラットフォームです。
              </p>
            </div>
          </section>

          {/* Values */}
          <section className="page-section">
            <p className="shop-eyebrow">Our Values</p>
            <h2>大切にしていること</h2>
            <div className="rp-rows mt-10">
              {VALUES.map((value) => (
                <div key={value.title}>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Story */}
          <section className="page-section">
            <p className="shop-eyebrow">Our Story</p>
            <h2>なぜ、犬服のリユースなのか</h2>
            <div className="rp-prose mt-8">
              <p>
                犬を飼っていると、服が余ります。子犬のうちに買ったけどすぐサイズアウトした服、プレゼントでもらったけど好みじゃなかった服、愛犬が旅立ってクローゼットに残ってしまった服。
              </p>
              <p>
                捨てるには惜しい。でも売る手間もかかる。そのまま引き出しの奥へ。そんな経験をした飼い主さんは多いはずです。
              </p>
              <p>
                一方で「保護犬を助けたい」という気持ちはあっても、日常の中で継続的に支援できている人はまだ少ない。特別なアクションを起こさないといけない、という心理的なハードルがあります。
              </p>
              <p>
                その2つをつなごうと思いました。<strong>服を手放す人</strong>と<strong>服を必要としている人</strong>をつなぎ、その取引の中に<strong>動物保護への寄付</strong>を組み込む。それが<strong>RePaw</strong>の出発点です。
              </p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="rp-band page-section">
          <div className="shop-container">
            <h2>あなたの服を、次の子へ。</h2>
            <div className="rp-prose mt-6">
              <p>眠っている犬服があれば、RePawで次のオーナーへつなぎましょう。売れるたびに、保護犬・保護猫への支援になります。</p>
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
