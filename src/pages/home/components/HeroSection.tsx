import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { DONATION_RATE_LABEL } from '../../../lib/donation';

interface HeroBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
}

// 全面写真のヒーロー。実写のショップ紹介を最初に表示し、管理バナーは手動で選ぶ。
// 直下に「約束」の行（寄付・一点物・前のオーナー）を小さく置く
export default function HeroSection() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.from('hero_banners')
      .select('id, title, subtitle, image_url, link_url, link_text')
      .eq('is_active', true).order('sort_order', { ascending: true })
      .then(({ data }) => { if (active) setBanners(data || []); });
    return () => { active = false; };
  }, []);

  const banner = currentIndex > 0 ? banners[currentIndex - 1] : null;
  const image = banner?.image_url || '/images/repaw-dog.jpg';
  const link = banner?.link_url?.trim();
  const linkText = banner?.link_text?.trim() || '詳しく見る';
  const cta = link
    ? (/^https?:\/\//.test(link)
        ? <a href={link} className="rp-btn rp-btn-white">{linkText}</a>
        : <Link to={link.startsWith('/') && !link.startsWith('//') ? link : '/products'} className="rp-btn rp-btn-white">{linkText}</Link>)
    : <Link to="/products" className="rp-btn rp-btn-white">犬服を探す</Link>;

  return (
    <>
      <section className="shop-hero" aria-label="RePawのご紹介">
        <figure className="shop-hero-photo">
          <img src={failedImage === image ? '/images/repaw-dog.jpg' : image} onError={() => setFailedImage(image)} alt={banner?.title || 'ハーネスを着て飼い主の膝に座るトイプードル'} fetchPriority="high" />
          {!banner && <figcaption>いつものお出かけに、もう一度。</figcaption>}
        </figure>
        <div className="shop-hero-copy">
          <div>
            <h1 className="rp-display">{banner?.title?.trim() || <>お気に入りを、<br />次のうちの子へ。</>}</h1>
            <p className="shop-hero-description">{banner?.subtitle?.trim() || 'まだ着られる一着に、新しい出会いを。犬服のリユースショップ、RePawです。'}</p>
            <div className="shop-hero-actions">{cta}</div>
          </div>
        </div>
        {banners.length > 0 && <div className="shop-hero-controls" aria-label="メインビジュアルの切り替え">
          {[null, ...banners].map((item, index) => <button key={item?.id || 'shop'} type="button" aria-label={index === 0 ? 'ショップ紹介を表示' : `お知らせ${index}：${item?.title || '犬服のリユース'}`} aria-pressed={index === currentIndex} onClick={() => setCurrentIndex(index)}>{String(index + 1).padStart(2, '0')}</button>)}
        </div>}
      </section>
      <div className="shop-container">
        <div className="shop-promises">
          <div><strong>お買い物の{DONATION_RATE_LABEL}を寄付</strong><span>販売価格の{DONATION_RATE_LABEL}を動物保護団体へ届けます</span></div>
          <div><strong>すべて一点物</strong><span>状態はA〜Cのランクと実寸で表示</span></div>
          <div><strong>前のオーナーが見える</strong><span>着ていた子と飼い主さんのInstagramをご紹介</span></div>
        </div>
      </div>
    </>
  );
}
