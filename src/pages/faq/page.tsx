import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { useState } from 'react';
import CtaBand from '../../components/CtaBand';

const FAQ_CATEGORIES = [
  {
    id: 'purchase',
    title: '購入について',
    icon: 'ri-shopping-bag-line',
    questions: [
      {
        question: '商品の状態はどのように確認できますか？',
        answer: '各商品ページに詳細な状態説明と写真を掲載しています。A〜Cランクで状態を分類しており、Aランクは新品同様、Bランクは使用感が少ない美品、Cランクは使用感がありますが良品です。気になる点があれば、お問い合わせフォームからご質問ください。'
      },
      {
        question: '支払い方法は何がありますか？',
        answer: 'クレジットカード（VISA、MasterCard、JCB、AMEX）、銀行振込、コンビニ決済、代金引換に対応しています。クレジットカード決済が最も迅速に発送できます。'
      },
      {
        question: '送料はいくらですか？',
        answer: '全国一律500円です。5,000円以上のご購入で送料無料となります。離島・一部地域は追加料金が発生する場合があります。'
      },
      {
        question: '配送にはどのくらいかかりますか？',
        answer: 'ご注文確定後、通常2〜3営業日以内に発送いたします。お届けまでは発送から1〜2日程度です。繁忙期や天候により遅れる場合がございます。'
      },
      {
        question: '返品・交換はできますか？',
        answer: '当サイトの商品はすべて中古品のため、原則として返品・交換はお受けしておりません。商品に重大な欠陥（破損・汚損など）がある場合のみ、到着後7日以内にご連絡いただければ対応いたします。状態ランクや写真をよくご確認の上、ご購入をお願いいたします。'
      }
    ]
  },
  {
    id: 'buyback',
    title: '買取について',
    icon: 'ri-hand-coin-line',
    questions: [
      {
        question: 'どんな商品を買取できますか？',
        answer: '犬用の服であれば、ブランド・ノーブランド問わず買取可能です。ただし、著しい汚れ、破損、臭いが強い商品は買取できない場合があります。洗濯済みの状態でお送りください。'
      },
      {
        question: '買取の流れを教えてください',
        answer: 'Webフォームから申し込み → 無料配送キット到着（3営業日以内）→ 商品を梱包・発送 → 査定（2〜3営業日）→ 査定結果のご連絡 → 入金または寄付の選択、という流れです。'
      },
      {
        question: '査定にはどのくらい時間がかかりますか？',
        answer: '商品到着後、通常2〜3営業日以内に査定結果をメールでお知らせします。繁忙期は少しお時間をいただく場合があります。'
      },
      {
        question: '査定額に納得できない場合は？',
        answer: '査定額にご納得いただけない場合、無料で返送いたします。返送料も当社が負担しますので、ご安心ください。'
      },
      {
        question: '買取金額はどのように決まりますか？',
        answer: 'ブランド、状態、需要などを総合的に判断して査定します。新品同様のAランクは定価の50〜70%、使用感が少ないBランクは30〜50%、使用感があるCランクは10〜30%が目安です。'
      },
      {
        question: '複数点まとめて買取できますか？',
        answer: 'はい、可能です。まとめて買取いただくことで、査定もスムーズに進みます。配送キットに入る範囲であれば、何点でもお送りいただけます。'
      }
    ]
  },
  {
    id: 'donation',
    title: '寄付について',
    icon: 'ri-heart-line',
    questions: [
      {
        question: '寄付先の団体はどこですか？',
        answer: '複数の動物保護NPO団体と提携しており、保護犬・保護猫の医療費、食費、シェルター運営費として活用されています。寄付実績は定期的に「社会貢献」ページで公開しています。'
      },
      {
        question: '買取金額の一部だけ寄付することはできますか？',
        answer: '現在は「全額入金」または「全額寄付」の2択となっております。一部寄付の機能は今後検討してまいります。'
      },
      {
        question: '寄付した場合、領収書は発行されますか？',
        answer: '寄付金の領収書は、提携NPO団体から発行されます。ご希望の方は、買取申し込み時にその旨をお知らせください。'
      },
      {
        question: '販売収益からの寄付とは何ですか？',
        answer: '買取時に「入金」を選択された場合でも、その商品が販売された際に販売価格の5%を自動的にNPOへ寄付する仕組みです。どちらを選んでも、動物保護活動に貢献できます。'
      }
    ]
  },
  {
    id: 'account',
    title: 'アカウント・その他',
    icon: 'ri-user-line',
    questions: [
      {
        question: '会員登録は必要ですか？',
        answer: '商品の購入や買取申し込みには会員登録が必要です。登録は無料で、メールアドレスとパスワードのみで簡単に登録できます。'
      },
      {
        question: 'パスワードを忘れてしまいました',
        answer: 'ログインページの「パスワードを忘れた方」からパスワード再設定のメールをお送りします。メールが届かない場合は、迷惑メールフォルダもご確認ください。'
      },
      {
        question: '個人情報の取り扱いについて教えてください',
        answer: 'お客様の個人情報は、商品の発送や買取手続きにのみ使用し、第三者に提供することはありません。詳しくは「プライバシーポリシー」をご覧ください。'
      },
      {
        question: 'メールマガジンの配信停止方法は？',
        answer: 'マイページの「設定」から、いつでもメールマガジンの配信停止が可能です。または、メール本文の配信停止リンクからも手続きできます。'
      },
      {
        question: 'サイトの使い方がわかりません',
        answer: 'お問い合わせフォームからご連絡ください。サポートチームが丁寧にご案内いたします。お電話でのサポートも準備中です。'
      }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('purchase');

  const currentCategory = FAQ_CATEGORIES.find(cat => cat.id === activeCategory);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_CATEGORIES.flatMap(cat =>
      cat.questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer },
      }))
    ),
  };

  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="よくある質問" description="RePawの購入・買取・寄付についてよくある質問をまとめました。" path="/faq" jsonLd={faqJsonLd} />
      <Navigation />

      <main className="page">
        <div className="shop-container">
          <PageHeader eyebrow="FAQ" title="よくある質問" lead="購入・買取・寄付・アカウントについて、よくいただく質問をまとめました。" />

          <section className="page-section !pt-0 max-w-[52em] mx-auto">
            <div className="rp-tabs rp-tabs-center" role="tablist">
              {FAQ_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.title}
                </button>
              ))}
            </div>

            {currentCategory && (
              <div className="rp-faq mt-2" key={currentCategory.id}>
                {currentCategory.questions.map((item) => (
                  <details key={item.question}>
                    <summary>{item.question}<i className="ri-arrow-down-s-line" aria-hidden="true"></i></summary>
                    <div className="rp-faq-answer">{item.answer}</div>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>

        <CtaBand
          title="解決しない場合は、お気軽に。"
          text="お探しの情報が見つからない場合は、お問い合わせフォームからご連絡ください。サポートチームが丁寧にご対応いたします。"
          primary={{ to: '/contact', label: 'お問い合わせ' }}
          secondary={{ to: '/products', label: '犬服を探す' }}
        />
      </main>

      <Footer />
    </div>
  );
}
