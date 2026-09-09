import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface Collection {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
}

export default function FeaturedSection() {
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        supabase
            .from('collections')
            .select('id, title, subtitle, description, cover_image_url')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .limit(3)
            .then(({ data }) => {
                if (data && data.length > 0) setCollections(data);
            });
    }, []);

    if (collections.length === 0) return null;

    return (
        <section className="shop-container shop-section shop-featured">
            <div className="shop-section-heading">
                <div><p className="shop-eyebrow">Journal</p><h2>犬と暮らす、日々のこと</h2></div>
                <Link to="/features" className="shop-text-link">特集一覧 <span aria-hidden="true">→</span></Link>
            </div>
            <div className={collections.length === 1 ? '' : 'grid md:grid-cols-2 gap-10'}>
                {collections.map(c => (
                    <Link key={c.id} to={`/features/${c.id}`} className={`shop-story group ${collections.length === 1 ? 'shop-story-wide' : ''}`}>
                        {c.cover_image_url && <img src={c.cover_image_url} alt={c.title} loading="lazy" />}
                        <div className="shop-story-copy">
                            {c.subtitle && <p className="text-xs text-stone-600 mb-3">{c.subtitle}</p>}
                            <h3 className="text-xl md:text-2xl font-medium group-hover:underline underline-offset-4">{c.title}</h3>
                            {c.description && <p className="mt-4 text-sm text-stone-600 leading-7">{c.description}</p>}
                            <span className="shop-text-link mt-6 inline-flex">続きを読む <span aria-hidden="true">→</span></span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
