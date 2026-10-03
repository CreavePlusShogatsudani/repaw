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

// 全面写真のヒーロー。管理画面（メインビジュアル）で有効にしたバナーだけを sort_order 順に出す。
// 2枚以上なら5秒ごとに切り替える（番号ボタンでも選べる）。1枚もなければヒーロー欄ごと出さない。
// タイトルの無いバナーは写真だけ（リンクを登録したときだけボタンを出す）。
// 直下に「約束」の行（寄付・一点物・前のオーナー）を小さく置く
export default function HeroSection() {
  const [banners, setBanners] = useState<HeroBanner[] | null>(null); // null = 読み込み中
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let active = true;
    supabase.from('hero_banners')
      .select('id, title, subtitle, image_url, link_url, link_text')
      .eq('is_active', true).order('sort_order', { ascending: true })
      .then(({ data }) => { if (active) setBanners(data || []); });
    return () => { active = false; };
  }, []);

  // 手動で選んだときもそこから5秒数え直す。動きを減らす設定の人には自動で切り替えない
  const count = banners?.length ?? 0;
  useEffect(() => {
    if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setCurrentIndex((i) => (i + 1) % count), 5000);
    return () => clearTimeout(timer);
  }, [count, currentIndex]);

  const banner = banners?.[currentIndex];
  const title = banner?.title?.trim();
  const subtitle = banner?.subtitle?.trim();
  const link = banner?.link_url?.trim();
  const linkText = banner?.link_text?.trim() || '詳しく見る';
  const cta = link
    ? (/^https?:\/\//.test(link)
        ? <a href={link} className="rp-btn rp-btn-white">{linkText}</a>
        : <Link to={link.startsWith('/') && !link.startsWith('//') ? link : '/products'} className="rp-btn rp-btn-white">{linkText}</Link>)
    : title ? <Link to="/products" className="rp-btn rp-btn-white">犬服を探す</Link> : null;

  return (
    <>
      {/* 見出しが画面に無いとき（写真だけのバナー・バナー0枚）も、検索エンジン向けの h1 は残す */}
      {!title && <h1 className="sr-only">RePaw 犬服のリユースショップ</h1>}

      {/* 読み込み中は同じ高さの枠を出しておき、下の内容がずれないようにする。0枚なら欄ごと出さない */}
      {banners === null ? (
        <div className="shop-hero" aria-hidden="true" />
      ) : banner && (
        <section className={`shop-hero${title || cta ? '' : ' shop-hero-plain'}`} aria-label="メインビジュアル">
          <figure className="shop-hero-photo">
            <img src={banner.image_url} alt={title || 'RePaw のお知らせ'} fetchPriority="high" />
          </figure>
          {(title || cta) && (
            <div className="shop-hero-copy">
              <div>
                {title && <h1 className="rp-display">{title}</h1>}
                {title && subtitle && <p className="shop-hero-description">{subtitle}</p>}
                {cta && <div className="shop-hero-actions">{cta}</div>}
              </div>
            </div>
          )}
          {count > 1 && <div className="shop-hero-controls" aria-label="メインビジュアルの切り替え">
            {banners.map((item, index) => <button key={item.id} type="button" aria-label={`メインビジュアル${index + 1}${item.title ? `：${item.title}` : ''}`} aria-pressed={index === currentIndex} onClick={() => setCurrentIndex(index)}>{String(index + 1).padStart(2, '0')}</button>)}
          </div>}
        </section>
      )}
      <div className="shop-container">
        <div className="shop-promises">
          <div><strong>お買い物の{DONATION_RATE_LABEL}を寄付</strong><span>販売価格の{DONATION_RATE_LABEL}を動物保護団体へ届けます</span></div>
          <div><strong>すべて一点物</strong><span>状態はA〜Cのランクと実寸で表示</span></div>
          <div><strong>前のオーナーが見える</strong><span>着ていた子と飼い主さんのInstagramをご紹介<br />※Instagramを表示にされている方のみ、リンクが表示されます</span></div>
        </div>
      </div>
    </>
  );
}
