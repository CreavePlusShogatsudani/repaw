import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import ProductMosaic from '../../components/ProductMosaic';
import CtaBand from '../../components/CtaBand';
import { DONATION_RATE_LABEL } from '../../lib/donation';
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

const APPRAISAL_POINTS = [
  {
    title: '状態',
    description: '汚れ・毛玉・ほつれ・におい・ゴムの伸びを確認し、A〜Cのランクを付けます。写真では分からない部分も、現物で丁寧に見ます。',
  },
  {
    title: 'ブランドと需要',
    description: 'ブランド、サイズ、季節、人気の傾向をもとに、次の飼い主さんに届きやすい価格から逆算して買取額を決めます。',
  },
  {
    title: 'お受けできないもの',
    description: '著しい汚れや破損、においが強いもの、犬服以外のものはお受けできない場合があります。その場合は申し込み時に選んだ方法（返送または寄付）でお返しします。',
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
        </div>

        {/* 買取の流れ: 4 ステップ */}
        <section className="page-section !pt-6">
          <div className="shop-container">
            <div className="page-section-center">
              <p className="shop-eyebrow">Process</p>
              <h2>買取の流れ</h2>
              <p className="page-section-lead">申し込みから入金・寄付まで、4つのステップで完了します。</p>
            </div>
            <div className="rp-steps mt-16">
              {PROCESS_STEPS.map((step) => (
                <div key={step.title}>
                  <span className="rp-num">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 査定の考え方: 率や目安額は出さない（トラブル防止）。決まり方と受けられない条件だけ */}
        <section className="rp-band">
          <div className="shop-container">
            <div className="page-section-center">
              <p className="shop-eyebrow">Appraisal</p>
              <h2 className="text-[32px] font-medium tracking-[.1em] leading-snug">査定の考え方</h2>
              <p className="page-section-lead">届いた服を1点ずつ確認し、状態とブランド、需要をもとに買取額をご案内します。査定結果にご納得いただけない場合は、無料で返送いたします。</p>
            </div>
            <div className="rp-numbered mt-14">
              {APPRAISAL_POINTS.map((item, i) => (
                <div key={item.title}>
                  <span className="rp-num">0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 寄付の仕組み: 2つのルート */}
        <section className="page-section">
          <div className="shop-container">
            <div className="rp-split">
              <figure className="rp-figure">
                <img src="/images/repaw-dog.jpg" alt="ハーネスを着て飼い主の膝に座るトイプードル" loading="lazy" />
              </figure>
              <div>
                <p className="shop-eyebrow">Donation</p>
                <h2>寄付の仕組み</h2>
                <p className="page-section-lead">あなたの選択が、動物保護活動を支えます。</p>
                <div className="mt-10 space-y-10">
                  <div className="grid grid-cols-[56px_1fr] gap-4">
                    <span className="font-['Playfair_Display'] italic text-[28px] leading-none">01</span>
                    <div>
                      <h3 className="text-[18px] font-medium tracking-[.04em]">売主からの直接寄付</h3>
                      <p className="mt-3 text-[14px] leading-8">買取査定後、「寄付する」を選択すると、買取金額の全額を動物保護NPOへ寄付します。</p>
                      <dl className="mt-4 grid grid-cols-[8em_1fr] gap-y-1 text-[13px] text-[color:var(--rp-muted)]">
                        <dt>例：買取査定額</dt><dd>¥5,000</dd>
                        <dt>寄付額</dt><dd>¥5,000（全額）</dd>
                      </dl>
                    </div>
                  </div>
                  <div className="grid grid-cols-[56px_1fr] gap-4">
                    <span className="font-['Playfair_Display'] italic text-[28px] leading-none">02</span>
                    <div>
                      <h3 className="text-[18px] font-medium tracking-[.04em]">販売収益からの寄付</h3>
                      <p className="mt-3 text-[14px] leading-8">商品が販売された際、販売価格の{DONATION_RATE_LABEL}を自動的にNPOへ寄付します。入金を選んだ場合でも、販売時に寄付が行われます。</p>
                      <dl className="mt-4 grid grid-cols-[8em_1fr] gap-y-1 text-[13px] text-[color:var(--rp-muted)]">
                        <dt>例：販売価格</dt><dd>¥8,000</dd>
                        <dt>寄付額（{DONATION_RATE_LABEL}）</dt><dd>¥400</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProductMosaic />

        {/* 寄付が支える活動 */}
        <section className="page-section">
          <div className="shop-container">
            <div className="page-section-center">
              <p className="shop-eyebrow">Support</p>
              <h2>寄付が支える活動</h2>
              <p className="page-section-lead">2つのルートから集まった寄付金は、保護犬・保護猫の医療費、食費、シェルター運営費として活用されます。</p>
            </div>
            <div className="rp-numbered mt-16">
              {SUPPORT_ITEMS.map((item, i) => (
                <div key={item.title}>
                  <span className="rp-num">0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center text-[13px] text-[color:var(--rp-muted)]">寄付実績は定期的に公開し、透明性を保っています。</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="page-section">
          <div className="shop-container max-w-[52em]">
            <div className="page-section-center">
              <p className="shop-eyebrow">FAQ</p>
              <h2>よくある質問</h2>
            </div>
            <div className="rp-faq mt-12">
              {faqs.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}<i className="ri-arrow-down-s-line" aria-hidden="true"></i></summary>
                  <div className="rp-faq-answer">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          title="着なくなった服を、新しい命へ。"
          text="申し込みは数分で完了します。届いた服は状態を見て査定し、入金か寄付かをお選びいただけます。"
          primary={{ to: '/buyback', label: '買取を申し込む' }}
          secondary={{ to: '/faq', label: 'よくある質問' }}
        />
      </main>

      <Footer />
    </div>
  );
}
