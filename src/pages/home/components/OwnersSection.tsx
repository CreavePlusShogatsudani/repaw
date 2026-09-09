import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { PRODUCT_SELECT, instagramUrl } from '../../../lib/products';
import type { PreviousOwner, Product } from '../../../types';
import ProductCard from '../../../components/ProductCard';

// 「あの子のおさがり」: 管理画面で「特集に出す」にした前のオーナーと、その子から届いた服
export default function OwnersSection() {
  const [owners, setOwners] = useState<PreviousOwner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: ownerRows } = await supabase
        .from('previous_owners')
        .select('*')
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(3);
      const featured = (ownerRows as PreviousOwner[]) || [];
      let items: Product[] = [];
      if (featured.length > 0) {
        const { data: productRows } = await supabase
          .from('products')
          .select(PRODUCT_SELECT)
          .in('previous_owner_id', featured.map((o) => o.id))
          .in('status', ['published', 'reserved', 'sold_out'])
          .order('created_at', { ascending: false });
        items = (productRows as unknown as Product[]) || [];
      }
      if (!active) return;
      setOwners(featured);
      setProducts(items);
      setLoaded(true);
    })();
    return () => { active = false; };
  }, []);

  if (!loaded || owners.length === 0) return null;

  return (
    <section className="shop-owners">
      <div className="shop-container">
        <div className="shop-section-heading" data-reveal>
          <div>
            <h2>あの子のおさがり</h2>
            <p>前に着ていた子と、飼い主さんのInstagramも一緒にご紹介。知っているあの子の服が見つかるかも。</p>
          </div>
        </div>
        {owners.map((owner) => {
          const ownerProducts = products.filter((p) => p.previous_owner_id === owner.id).slice(0, 4);
          return (
            <article key={owner.id} className="owner-story" data-reveal>
              <div className="owner-profile">
                {owner.dog_photo_url
                  ? <img src={owner.dog_photo_url} alt={`${owner.dog_name}ちゃん`} className="owner-photo" loading="lazy" />
                  : <div className="owner-photo flex items-center justify-center"><i className="ri-emotion-happy-line text-4xl text-white"></i></div>}
                <p className="owner-name">{owner.dog_name}ちゃん</p>
                {owner.instagram && (
                  <a href={instagramUrl(owner.instagram)} target="_blank" rel="noopener noreferrer" className="owner-instagram">
                    <i className="ri-instagram-line" aria-hidden="true"></i>@{owner.instagram}
                  </a>
                )}
                {owner.story && <p className="owner-story-text">{owner.story}</p>}
              </div>
              <div className="owner-products">
                <h3>{owner.dog_name}ちゃんから届いた服</h3>
                {ownerProducts.length > 0 ? (
                  <div className="owner-products-grid">
                    {ownerProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">近日入荷予定です。</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
