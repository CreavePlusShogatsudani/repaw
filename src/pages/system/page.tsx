import { Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'オンライン申し込み',
    description: 'Webフォームから簡単に買取申し込み。必要事項を入力するだけで完了します。',
    icon: 'ri-smartphone-line'
  },
  {
    number: '02',
    title: '無料配送キット到着',
    description: '申し込み後、3営業日以内に無料の配送キットをお届けします。',
    icon: 'ri-box-3-line'
  },
  {
    number: '03',
    title: '商品を梱包・発送',
    description: '配送キットに犬服を入れて、集荷依頼または最寄りのコンビニから発送。',
    icon: 'ri-truck-line'
  },
  {
    number: '04',
    title: '査定・入金 or 寄付',
    description: '到着後、専門スタッフが査定。入金または全額寄付を選択できます。',
    icon: 'ri-money-dollar-circle-line'
  }
];

const RANKS = [
  {
    icon: 'ri-star-line',
    rank: 'Aランク',
    condition: '新品同様・未使用品',
    rate: '50-70%',
    note: '定価の50-70%で買取',
    featured: true,
  },
  {
    icon: 'ri-star-half-line',
    rank: 'Bランク',
    condition: '使用感少ない美品',
    rate: '30-50%',
    note: '定価の30-50%で買取',
    featured: false,
  },
  {
    icon: 'ri-star-s-line',
    rank: 'Cランク',
    condition: '使用感あり・良品',
    rate: '10-30%',
    note: '定価の10-30%で買取',
    featured: false,
  },
];

const SUPPORT_ITEMS = [
  {
    icon: 'ri-heart-pulse-line',
    title: '医療支援',
    description: '保護動物の治療費・ワクチン接種費用',
  },
  {
    icon: 'ri-restaurant-line',
    title: '食事支援',
    description: '栄養バランスの取れた食事の提供',
  },
  {
    icon: 'ri-home-heart-line',
    title: 'シェルター運営',
    description: '安全で快適な保護施設の維持管理',
  },
];

const faqs = [
  {
    question: '買取できる商品の条件は？',
    answer: '犬用の服であれば、ブランド・ノーブランド問わず買取可能です。ただし、著しい汚れや破損がある場合は買取できない場合があります。'
  },
  {
    question: '査定にはどのくらい時間がかかりますか？',
    answer: '商品到着後、通常2-3営業日以内に査定結果をメールでお知らせします。'
  },
  {
    question: '査定額に納得できない場合は？',
    answer: '査定額にご納得いただけない場合、無料で返送いたします。返送料も当社が負担します。'
  },
  {
    question: '寄付先の団体はどこですか？',
    answer: '複数の動物保護NPO団体と提携しており、寄付実績は定期的に公開しています。詳しくは「社会貢献」ページをご覧ください。'
  },
  {
    question: '買取金額の一部だけ寄付することはできますか？',
    answer: '現在は「全額入金」または「全額寄付」の2択となっております。一部寄付の機能は今後検討してまいります。'
  }
];

export default function SystemPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="買取・寄付の仕組み" description="RePawの犬服買取から動物保護団体への寄付までの流れをご説明します。" path="/system" />
      <Navigation />

      <main className="page">
        <div className="shop-container">
          <PageHeader eyebrow="How it works" title="買取・寄付の仕組み" lead="犬服の買取から、動物保護団体への寄付までの流れをご説明します。" />

          {/* Process */}
          <section className="page-section">
            <p className="shop-eyebrow">Process</p>
            <h2>買取の流れ</h2>
            <p className="mt-3 text-sm text-[color:var(--rp-muted)]">簡単4ステップで買取完了</p>
            <div className="rp-steps mt-10">
              {PROCESS_STEPS.map((step) => (
                <div key={step.title}>
                  <span className="rp-num">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="page-section">
            <p className="shop-eyebrow">Pricing</p>
            <h2>買取価格の目安</h2>
            <p className="mt-3 text-sm text-[color:var(--rp-muted)]">状態とブランドに応じて適正価格で買取</p>
            <div className="rp-rows mt-10">
              {RANKS.map((rank) => (
                <div key={rank.rank}>
                  <h3>{rank.rank}</h3>
                  <p>{rank.condition}。{rank.note}。</p>
                </div>
              ))}
            </div>
          </section>

          {/* Donation */}
          <section className="page-section">
            <p className="shop-eyebrow">Donation</p>
            <h2>寄付の仕組み</h2>
            <p className="mt-3 text-sm text-[color:var(--rp-muted)]">あなたの選択が動物保護活動を支えます</p>
            <div className="rp-rows mt-10">
              <div>
                <h3>ルート① 売主からの直接寄付</h3>
                <div>
                  <p>買取査定後、「寄付する」を選択すると、買取金額の<strong>全額</strong>を動物保護NPOへ寄付します。</p>
                  <dl className="mt-4 text-sm text-[color:var(--rp-muted)]">
                    <div className="flex gap-4"><dt>例：買取査定額</dt><dd>¥5,000</dd></div>
                    <div className="flex gap-4"><dt>寄付額</dt><dd>¥5,000（全額が動物保護団体へ）</dd></div>
                  </dl>
                </div>
              </div>
              <div>
                <h3>ルート② 販売収益からの寄付</h3>
                <div>
                  <p>商品が販売された際、販売価格の<strong>5%</strong>を自動的にNPOへ寄付します。入金を選んだ場合でも、販売時に寄付が行われます。</p>
                  <dl className="mt-4 text-sm text-[color:var(--rp-muted)]">
                    <div className="flex gap-4"><dt>例：販売価格</dt><dd>¥8,000</dd></div>
                    <div className="flex gap-4"><dt>寄付額（5%）</dt><dd>¥400（販売時に自動寄付）</dd></div>
                  </dl>
                </div>
              </div>
            </div>
          </section>

          {/* 寄付が支える活動 */}
          <section className="page-section">
            <h2>寄付が支える活動</h2>
            <div className="rp-prose mt-8">
              <p>
                RePawでは、2つのルートから集まった寄付金を動物保護団体へ届けています。あなたの選択が、保護犬・保護猫の医療費、食費、シェルター運営費として活用され、多くの命を救う活動に繋がります。
              </p>
            </div>
            <div className="rp-rows mt-10">
              {SUPPORT_ITEMS.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[color:var(--rp-muted)]">寄付実績は定期的に公開し、透明性を保っています。</p>
          </section>

          {/* FAQ */}
          <section className="page-section">
            <p className="shop-eyebrow">FAQ</p>
            <h2>よくある質問</h2>
            <div className="rp-faq mt-10">
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}<i className="ri-arrow-down-s-line" aria-hidden="true"></i></summary>
                  <div className="rp-faq-answer">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="rp-band page-section">
          <div className="shop-container">
            <h2>今すぐ買取申し込み</h2>
            <div className="rp-prose mt-6">
              <p>使わなくなった犬服を、新しい命へ繋げませんか？</p>
            </div>
            <div className="mt-8">
              <Link to="/buyback" className="rp-btn rp-btn-black">買取を申し込む</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
