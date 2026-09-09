import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// 実際の商品写真を全幅に並べる帯。下層ページに「お店の空気」を持ち込むための実写素材。
// 写真が 4 枚未満なら何も出さない
export default function ProductMosaic({ count = 6 }: { count?: number }) {
  const [items, setItems] = useState<{ id: string; image: string; name: string }[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from('products')
      .select('id, name, images')
      .in('status', ['published', 'reserved', 'sold_out'])
      .not('images', 'is', null)
      .order('created_at', { ascending: false })
      .limit(count * 2)
      .then(({ data }) => {
        if (!active) return;
        const seen = new Set<string>();
        const picked: { id: string; image: string; name: string }[] = [];
        for (const row of (data as { id: string; name: string; images: string[] | null }[]) || []) {
          const image = row.images?.[0];
          if (!image || seen.has(image)) continue;
          seen.add(image);
          picked.push({ id: row.id, image, name: row.name });
          if (picked.length >= count) break;
        }
        setItems(picked);
      });
    return () => { active = false; };
  }, [count]);

  if (items.length < 4) return null;

  return (
    <div className="rp-mosaic" aria-label="最近入荷した犬服">
      {items.map((item) => (
        <Link key={item.id} to={`/product/${item.id}`} aria-label={item.name}>
          <img src={item.image} alt="" loading="lazy" />
        </Link>
      ))}
    </div>
  );
}
