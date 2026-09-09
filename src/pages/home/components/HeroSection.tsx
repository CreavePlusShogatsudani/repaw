import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface HeroBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
}

// 実写のショップ紹介を最初に表示。管理バナーは手動で選び、閲覧中にコピーやリンクを変えない。
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

  return (
    <section className="shop-hero shop-container" aria-label="RePawのご紹介">
      <div className="shop-hero-copy">
        <p className="shop-eyebrow">犬服と、次の暮らし。</p>
        <h1>{banner?.title?.trim() || <>お気に入りを、<br />次のうちの子へ。</>}</h1>
        <p className="shop-hero-description">{banner?.subtitle?.trim() || <>まだ着られる一着に、新しい出会いを。<br />犬服のリユースショップ、RePawです。</>}</p>
        <Link to="/products" className="shop-button">犬服を探す <span aria-hidden="true">→</span></Link>
        {link ? (
          /^https?:\/\//.test(link)
            ? <a href={link} className="shop-hero-secondary">{linkText}</a>
            : <Link to={link.startsWith('/') && !link.startsWith('//') ? link : '/products'} className="shop-hero-secondary">{linkText}</Link>
        ) : <Link to="/system" className="shop-hero-secondary">着なくなった犬服を譲る</Link>}
      </div>
      <figure className="shop-hero-photo">
        <img src={failedImage === image ? '/images/repaw-dog.jpg' : image} onError={() => setFailedImage(image)} alt={banner?.title || 'ハーネスを着て飼い主の膝に座るトイプードル'} fetchPriority="high" />
        {!banner && <figcaption>いつものお出かけに、もう一度。</figcaption>}
        {banners.length > 0 && <div className="shop-hero-controls" aria-label="メインビジュアルの切り替え">
          {[null, ...banners].map((item, index) => <button key={item?.id || 'shop'} type="button" aria-label={index === 0 ? 'ショップ紹介を表示' : `お知らせ${index}：${item?.title || '犬服のリユース'}`} aria-pressed={index === currentIndex} onClick={() => setCurrentIndex(index)}>{String(index + 1).padStart(2, '0')}</button>)}
        </div>}
      </figure>
    </section>
  );
}
