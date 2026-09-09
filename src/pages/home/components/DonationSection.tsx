import { Link } from 'react-router-dom';
import { DONATION_RATE_LABEL } from '../../../lib/donation';

// お買い物が支援になる仕組みと、着なくなった服を譲る流れ
export default function DonationSection() {
  return (
    <section id="service" className="shop-container shop-section">
      <div className="shop-donation" data-reveal>
        <div>
          <p className="donation-rate">{DONATION_RATE_LABEL}</p>
          <h2 className="mt-3">お買い物が、<br />動物たちの支援になる。</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">RePawで買った犬服の販売価格の{DONATION_RATE_LABEL}を、動物保護団体へ寄付しています。特別なことをしなくても、好きな服を選ぶだけで支援に。</p>
          <ul className="donation-facts">
            <li><i className="ri-heart-3-fill" aria-hidden="true"></i><span><strong>寄付先</strong>: 提携している動物保護NPO</span></li>
            <li><i className="ri-first-aid-kit-fill" aria-hidden="true"></i><span><strong>使いみち</strong>: 保護犬・保護猫の医療費、食費、シェルターの運営費</span></li>
            <li><i className="ri-bar-chart-box-fill" aria-hidden="true"></i><span><strong>実績</strong>: 寄付の報告はニュースと「動物たちへの支援」ページで公開</span></li>
          </ul>
          <Link to="/impact" className="rp-btn rp-btn-blue mt-8">取り組みと実績を見る</Link>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">着なくなった服も、次の子へ</h3>
          <ol className="shop-steps">
            <li><span>1</span><div><h3>フォームから申し込み</h3><p>ログインして、譲りたい犬服の情報を送るだけ。</p></div></li>
            <li><span>2</span><div><h3>送って査定</h3><p>届いた服の状態を見て、買取額をご案内します。</p></div></li>
            <li><span>3</span><div><h3>受け取る、または寄付する</h3><p>買取額の受け取りか、動物保護団体への寄付を選べます。</p></div></li>
          </ol>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/buyback" className="rp-btn rp-btn-orange">買取を申し込む</Link>
            <Link to="/system" className="rp-btn rp-btn-outline">仕組みをくわしく</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
