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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white font-['Noto_Sans_JP']">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Warm%20and%20inviting%20photograph%20of%20a%20cozy%20dog%20clothing%20boutique%20interior%20with%20soft%20natural%20lighting%20streaming%20through%20large%20windows%20featuring%20neatly%20organized%20shelves%20displaying%20colorful%20dog%20sweaters%20coats%20and%20accessories%20in%20earth%20tones%20pastels%20and%20neutral%20colors%20wooden%20display%20fixtures%20potted%20plants%20and%20a%20welcoming%20atmosphere%20that%20emphasizes%20sustainability%20and%20quality%20craftsmanship%20in%20pet%20fashion&width=1920&height=1080&seq=systemhero2024original&orientation=landscape"
            alt="System Hero"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Buy & Donate System
          </h1>
          <p className="text-lg font-light">買取・寄付の仕組み</p>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">買取の流れ</h2>
            <p className="text-gray-600 text-sm font-light">簡単4ステップで買取完了</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full mx-auto mb-6">
                  <i className={`${step.icon} text-4xl`}></i>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-200 mb-2">{step.number}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">買取価格の目安</h2>
            <p className="text-gray-600 text-sm font-light">状態とブランドに応じて適正価格で買取</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full mx-auto mb-6">
                <i className="ri-star-line text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Aランク</h3>
              <p className="text-sm text-gray-600 mb-4 font-light">新品同様・未使用品</p>
              <div className="text-3xl font-bold text-orange-600 mb-2">50-70%</div>
              <p className="text-xs text-gray-500 font-light">定価の50-70%で買取</p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full mx-auto mb-6">
                <i className="ri-star-half-line text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Bランク</h3>
              <p className="text-sm text-gray-600 mb-4 font-light">使用感少ない美品</p>
              <div className="text-3xl font-bold text-gray-600 mb-2">30-50%</div>
              <p className="text-xs text-gray-500 font-light">定価の30-50%で買取</p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full mx-auto mb-6">
                <i className="ri-star-s-line text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Cランク</h3>
              <p className="text-sm text-gray-600 mb-4 font-light">使用感あり・良品</p>
              <div className="text-3xl font-bold text-gray-600 mb-2">10-30%</div>
              <p className="text-xs text-gray-500 font-light">定価の10-30%で買取</p>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">寄付の仕組み</h2>
            <p className="text-gray-600 text-sm font-light">あなたの選択が動物保護活動を支えます</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* ルート1 */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-orange-500 rounded-xl">
                  <i className="ri-hand-heart-line text-2xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold">ルート① 売主からの直接寄付</h3>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">
                買取査定後、「寄付する」を選択すると、買取金額の<strong className="text-orange-600 font-bold">全額</strong>を動物保護NPOへ寄付します。
              </p>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 font-light">例：買取査定額</span>
                  <span className="text-2xl font-bold">¥5,000</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">寄付額</span>
                    <span className="text-3xl font-bold text-orange-600">¥5,000</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-light">全額が動物保護団体へ</p>
                </div>
              </div>
            </div>

            {/* ルート2 */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-orange-500 rounded-xl">
                  <i className="ri-shopping-cart-line text-2xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold">ルート② 販売収益からの寄付</h3>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">
                商品が販売された際、販売価格の<strong className="text-orange-600 font-bold">5%</strong>を自動的にNPOへ寄付します。入金を選んだ場合でも、販売時に寄付が行われます。
              </p>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 font-light">例：販売価格</span>
                  <span className="text-2xl font-bold">¥8,000</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">寄付額（5%）</span>
                    <span className="text-3xl font-bold text-orange-600">¥400</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-light">販売時に自動寄付</p>
                </div>
              </div>
            </div>
          </div>

          {/* 寄付先の説明 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="w-full h-96 bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src="https://readdy.ai/api/search-image?query=Heartwarming%20photograph%20of%20rescued%20shelter%20dogs%20of%20various%20breeds%20sitting%20together%20in%20a%20bright%20modern%20animal%20shelter%20with%20clean%20white%20walls%20and%20natural%20lighting%20happy%20and%20hopeful%20atmosphere%20professional%20photography%20for%20animal%20welfare%20charity%20program&width=600&height=600&seq=shelterdogs2024&orientation=squarish"
                alt="動物保護"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-6">寄付が支える活動</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-8 font-light">
                RePowでは、2つのルートから集まった寄付金を動物保護団体へ届けています。
                あなたの選択が、保護犬・保護猫の医療費、食費、シェルター運営費として活用され、
                多くの命を救う活動に繋がります。
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600 rounded-full">
                    <i className="ri-heart-pulse-line text-2xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">医療支援</h4>
                    <p className="text-sm text-gray-600 font-light">保護動物の治療費・ワクチン接種費用</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600 rounded-full">
                    <i className="ri-restaurant-line text-2xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">食事支援</h4>
                    <p className="text-sm text-gray-600 font-light">栄養バランスの取れた食事の提供</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600 rounded-full">
                    <i className="ri-home-heart-line text-2xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">シェルター運営</h4>
                    <p className="text-sm text-gray-600 font-light">安全で快適な保護施設の維持管理</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-light">
                  <i className="ri-information-line text-orange-600 mr-2"></i>
                  寄付実績は定期的に公開し、透明性を保っています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">よくある質問</h2>
            <p className="text-gray-600 text-sm font-light">FAQ</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-orange-50 transition-colors"
                >
                  <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 text-white flex-shrink-0 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}>
                    <i className="ri-arrow-down-s-line text-xl"></i>
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-orange-50/50 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            今すぐ買取申し込み
          </h2>
          <p className="text-gray-600 mb-8 font-light">
            使わなくなった犬服を、新しい命へ繋げませんか？
          </p>
          <button 
            onClick={() => navigate('/buyback')}
            className="px-12 py-4 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            買取を申し込む
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}