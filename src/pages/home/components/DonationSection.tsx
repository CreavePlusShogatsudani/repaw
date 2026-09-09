import { Link } from 'react-router-dom';
import { DONATION_RATE_LABEL } from '../../../lib/donation';

// お買い物が支援になる仕組みと、着なくなった服を譲る流れ。生成り地にテキストだけで静かに
export default function DonationSection() {
  return (
    <section id="service" className="shop-donation">
      <div className="shop-container shop-donation-inner" data-reveal>
        <div>
          <p className="shop-eyebrow">Impact</p>
          <h2>お買い物が、<br />動物たちの支援になる。</h2>
          <p className="mt-4 text-sm leading-8 text-[color:var(--rp-text)] max-w-[34em]">RePawで買った犬服の販売価格の{DONATION_RATE_LABEL}を、動物保護団体へ寄付しています。特別なことをしなくても、好きな服を選ぶだけで支援になります。</p>
          <dl className="donation-facts">
            <div><dt>寄付先</dt><dd>提携している動物保護NPO</dd></div>
            <div><dt>使いみち</dt><dd>保護犬・保護猫の医療費、食費、シェルターの運営費</dd></div>
            <div><dt>報告</dt><dd>寄付の実績はニュースと「動物たちへの支援」ページで公開</dd></div>
          </dl>
          <Link to="/impact" className="shop-text-link mt-7">取り組みと実績を見る</Link>
        </div>
        <div>
          <p className="shop-eyebrow">Pass it on</p>
          <h2>着なくなった服も、<br />次の子へ。</h2>
          <ol className="shop-steps mt-6">
            <li><span>1</span><div><h3>フォームから申し込み</h3><p>ログインして、譲りたい犬服の情報を送るだけ。</p></div></li>
            <li><span>2</span><div><h3>送って査定</h3><p>届いた服の状態を見て、買取額をご案内します。</p></div></li>
            <li><span>3</span><div><h3>受け取る、または寄付する</h3><p>買取額の受け取りか、動物保護団体への寄付を選べます。</p></div></li>
          </ol>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-7">
            <Link to="/buyback" className="rp-btn rp-btn-black">買取を申し込む</Link>
            <Link to="/system" className="shop-text-link self-center">仕組みをくわしく</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
