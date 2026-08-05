import PageMeta from '../../components/PageMeta';
import StitchedImage from '../../components/StitchedImage';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const serif = { fontFamily: "'Playfair Display', serif" };

export default function SystemPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="買取・寄付の仕組み" description="RePawの犬服買取から動物保護団体への寄付までの流れをご説明します。" path="/system" />
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-96 md:h-[28rem] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Warm%20and%20inviting%20photograph%20of%20a%20cozy%20dog%20clothing%20boutique%20interior%20with%20soft%20natural%20lighting%20streaming%20through%20large%20windows%20featuring%20neatly%20organized%20shelves%20displaying%20colorful%20dog%20sweaters%20coats%20and%20accessories%20in%20earth%20tones%20pastels%20and%20neutral%20colors%20wooden%20display%20fixtures%20potted%20plants%20and%20a%20welcoming%20atmosphere%20that%20emphasizes%20sustainability%20and%20quality%20craftsmanship%20in%20pet%20fashion&width=1920&height=1080&seq=systemhero2024original&orientation=landscape"
            alt="System Hero"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-orange-950/50"></div>
        </div>

        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={serif}>
            Buy &amp; Donate System
          </h1>
          <p className="text-lg md:text-xl">買取・寄付の仕組み</p>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>Process</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">買取の流れ</h2>
            <p className="text-base md:text-lg text-gray-600">簡単4ステップで買取完了</p>
          </div>

          <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* 縫い目のつなぎ線（PC） */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-orange-300" aria-hidden="true"></div>
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-20 h-20 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mx-auto mb-5 relative z-10">
                  <i className={`${step.icon} text-3xl`}></i>
                </div>
                <div className="text-2xl md:text-3xl text-orange-300 italic mb-2" style={serif}>{step.number}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-base leading-relaxed text-gray-700 text-left md:text-center max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28 px-6 bg-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">買取価格の目安</h2>
            <p className="text-base md:text-lg text-gray-600">状態とブランドに応じて適正価格で買取</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {RANKS.map((rank, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl p-8 text-center border ${rank.featured ? 'border-orange-300 shadow-md' : 'border-orange-100'}`}
              >
                <div className={`w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 ${rank.featured ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600'}`}>
                  <i className={`${rank.icon} text-3xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{rank.rank}</h3>
                <p className="text-base text-gray-700 mb-5">{rank.condition}</p>
                <div className={`text-4xl font-bold mb-2 ${rank.featured ? 'text-orange-600' : 'text-gray-700'}`}>{rank.rate}</div>
                <p className="text-sm text-gray-500">{rank.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>Donation</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">寄付の仕組み</h2>
            <p className="text-base md:text-lg text-gray-600">あなたの選択が動物保護活動を支えます</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-24">
            {/* ルート1 */}
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-orange-600 rounded-xl flex-shrink-0">
                  <i className="ri-hand-heart-line text-2xl text-white"></i>
                </div>
                <h3 className="text-xl md:text-2xl font-bold">ルート① 売主からの直接寄付</h3>
              </div>

              <p className="text-base leading-relaxed text-gray-700 mb-6">
                買取査定後、「寄付する」を選択すると、買取金額の<strong className="text-orange-600 font-bold">全額</strong>を動物保護NPOへ寄付します。
              </p>

              <div className="bg-orange-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base text-gray-600">例：買取査定額</span>
                  <span className="text-2xl font-bold">¥5,000</span>
                </div>
                <div className="border-t border-dashed border-orange-300 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold">寄付額</span>
                    <span className="text-3xl font-bold text-orange-600">¥5,000</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">全額が動物保護団体へ</p>
                </div>
              </div>
            </div>

            {/* ルート2 */}
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-orange-600 rounded-xl flex-shrink-0">
                  <i className="ri-shopping-cart-line text-2xl text-white"></i>
                </div>
                <h3 className="text-xl md:text-2xl font-bold">ルート② 販売収益からの寄付</h3>
              </div>

              <p className="text-base leading-relaxed text-gray-700 mb-6">
                商品が販売された際、販売価格の<strong className="text-orange-600 font-bold">5%</strong>を自動的にNPOへ寄付します。入金を選んだ場合でも、販売時に寄付が行われます。
              </p>

              <div className="bg-orange-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base text-gray-600">例：販売価格</span>
                  <span className="text-2xl font-bold">¥8,000</span>
                </div>
                <div className="border-t border-dashed border-orange-300 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold">寄付額（5%）</span>
                    <span className="text-3xl font-bold text-orange-600">¥400</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">販売時に自動寄付</p>
                </div>
              </div>
            </div>
          </div>

          {/* 寄付先の説明 */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <StitchedImage
              src="https://readdy.ai/api/search-image?query=Heartwarming%20photograph%20of%20rescued%20shelter%20dogs%20of%20various%20breeds%20sitting%20together%20in%20a%20bright%20modern%20animal%20shelter%20with%20clean%20white%20walls%20and%20natural%20lighting%20happy%20and%20hopeful%20atmosphere%20professional%20photography%20for%20animal%20welfare%20charity%20program&width=600&height=600&seq=shelterdogs2024&orientation=squarish"
              alt="動物保護"
              className="aspect-square max-w-md mx-auto w-full"
              tilt="left"
            />

            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-6">寄付が支える活動</h3>
              <p className="text-base md:text-lg leading-loose text-gray-700 mb-8">
                RePawでは、2つのルートから集まった寄付金を動物保護団体へ届けています。あなたの選択が、保護犬・保護猫の医療費、食費、シェルター運営費として活用され、多くの命を救う活動に繋がります。
              </p>

              <div className="space-y-5">
                {SUPPORT_ITEMS.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-orange-100 text-orange-600 rounded-full">
                      <i className={`${item.icon} text-2xl`}></i>
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold mb-1">{item.title}</h4>
                      <p className="text-base text-gray-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-orange-300">
                <p className="text-base text-gray-700">
                  <i className="ri-information-line text-orange-600 mr-2"></i>
                  寄付実績は定期的に公開し、透明性を保っています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 px-6 bg-orange-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 md:mb-16">
            <p className="text-orange-600 italic text-lg md:text-xl mb-3" style={serif}>FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold">よくある質問</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-base md:text-lg font-bold text-gray-900 pr-4">{faq.question}</span>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-orange-600 text-white flex-shrink-0 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}>
                    <i className="ri-arrow-down-s-line text-xl"></i>
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-5 bg-orange-50/60 border-t border-dashed border-orange-200">
                    <p className="text-base leading-relaxed text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-6 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            今すぐ買取申し込み
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-orange-50 mb-10">
            使わなくなった犬服を、新しい命へ繋げませんか？
          </p>
          <button
            onClick={() => navigate('/buyback')}
            className="px-12 py-4 bg-white text-orange-600 rounded-full text-sm md:text-base font-bold hover:bg-orange-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            買取を申し込む
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
