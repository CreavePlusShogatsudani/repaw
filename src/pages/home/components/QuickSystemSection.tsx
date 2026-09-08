import { Link } from 'react-router-dom';

export default function QuickSystemSection() {
  return (
    <section id="service" className="shop-service">
      <div className="shop-container grid md:grid-cols-2 gap-10 md:gap-20">
        <div>
          <p className="shop-eyebrow">PASS IT ON</p>
          <h2>着なくなっても、<br />誰かのお気に入りに。</h2>
          <p className="mt-5 text-sm leading-7 text-stone-600">サイズが合わなくなった服、出番が少なくなった服。<br className="hidden md:block" />RePawが買い取り、次の飼い主へつなぎます。</p>
          <Link to="/buyback" className="shop-text-link mt-6 inline-flex">買取を申し込む <span aria-hidden="true">→</span></Link>
        </div>
        <div className="self-center">
          <ol className="shop-steps">
            <li><span>01</span><div><h3>写真を送って申し込み</h3><p>犬服の写真と情報をフォームから送信。</p></div></li>
            <li><span>02</span><div><h3>発送・査定</h3><p>届いた犬服の状態を確認し、査定額をご案内。</p></div></li>
            <li><span>03</span><div><h3>受け取る、または寄付する</h3><p>買取金額の受け取りか、動物保護団体への寄付を選べます。</p></div></li>
          </ol>
          <Link to="/system" className="shop-text-link mt-5 inline-flex">買取・寄付の仕組みを見る <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <div className="shop-container mt-10 md:mt-14">
        <div className="shop-donation-note"><p>お買い物も、動物たちへの支援に。<span>販売価格の5%を動物保護団体へ寄付します。</span></p><Link to="/impact" className="shop-text-link shrink-0">取り組みを見る <span aria-hidden="true">→</span></Link></div>
      </div>
    </section>
  );
}
