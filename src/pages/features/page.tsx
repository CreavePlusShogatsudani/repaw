import { useEffect, useState } from 'react';
import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import { Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';

interface Collection {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    tag: string | null;
    product_count?: number;
}

export default function FeaturesPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('collections')
            .select('*, collection_products(count)')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .then(({ data }) => {
                const mapped = (data || []).map((c: any) => ({
                    ...c,
                    product_count: c.collection_products?.[0]?.count ?? 0,
                }));
                setCollections(mapped);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <PageMeta title="特集" description="RePawの犬服リユース特集一覧。季節・ブランド・テーマ別におすすめ商品をまとめてご紹介します。" path="/features" />
            <Navigation />

            <main className="page">
                <div className="shop-container pb-24">
                    <PageHeader eyebrow="Journal" title="特集・読みもの" lead="犬と暮らす日々のことと、テーマごとにまとめた犬服をご紹介します。" />

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" role="status" aria-label="読み込んでいます">
                            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="product-skeleton !aspect-[4/3]" />)}
                        </div>
                    ) : collections.length === 0 ? (
                        <p className="py-24 text-center text-sm text-[color:var(--rp-muted)]">現在公開中の特集はありません。</p>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                            {collections.map((c) => (
                                <Link key={c.id} to={`/features/${c.id}`} className="group block">
                                    <div className="aspect-[4/3] overflow-hidden bg-[color:var(--rp-photo-bg)]">
                                        {c.cover_image_url ? (
                                            <img src={c.cover_image_url} alt={c.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[color:var(--rp-muted)]"><i className="ri-image-line text-3xl"></i></div>
                                        )}
                                    </div>
                                    <div className="pt-5">
                                        {(c.tag || c.subtitle) && <p className="text-xs tracking-[.06em] text-[color:var(--rp-muted)]">{c.tag || c.subtitle}</p>}
                                        <h2 className="mt-2 text-xl font-medium tracking-[.04em] leading-relaxed group-hover:underline underline-offset-4">{c.title}</h2>
                                        {c.description && <p className="mt-3 text-sm leading-7 text-[color:var(--rp-text)] line-clamp-2">{c.description}</p>}
                                        <p className="mt-4 text-xs tracking-[.06em] text-[color:var(--rp-muted)]">{c.product_count}点の犬服</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
