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

// 管理画面「メインビジュアル」の有効バナーを表示する。未登録時は静的な既定コピーと写真を出す。
// 複数登録されている場合は5秒ごとに切り替える
export default function HeroSection() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    supabase
      .from('hero_banners')
      .select('id, title, subtitle, image_url, link_url, link_text')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setBanners((data as HeroBanner[]) || []));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrentIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[currentIndex];

  return (
    <section className="shop-hero shop-container">
      <div className="shop-hero-copy">
        <p className="shop-eyebrow">犬服と、次の暮らし。</p>
        <h1>{banner?.title || <>お気に入りを、<br />次のうちの子へ。</>}</h1>
        <p className="shop-hero-description">{banner?.subtitle || <>まだ着られる一着に、新しい出会いを。<br />犬服のリユースショップ、RePawです。</>}</p>
        <Link to={banner?.link_url || '/products'} className="shop-button">{banner?.link_text || '犬服を探す'} <span aria-hidden="true">→</span></Link>
        <Link to="/system" className="shop-hero-secondary">着なくなった犬服を譲る</Link>
      </div>
      <figure className="shop-hero-photo">
        {banner ? (
          <img key={banner.id} src={banner.image_url} alt={banner.title || ''} fetchPriority="high" />
        ) : (
          <>
            <img src="/images/repaw-dog.jpg" alt="ハーネスを着て飼い主の膝に座るトイプードル" fetchPriority="high" />
            <figcaption>いつものお出かけに、もう一度。</figcaption>
          </>
        )}
      </figure>
    </section>
  );
}
