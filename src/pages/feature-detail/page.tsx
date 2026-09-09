import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import ProductCard from '../../components/ProductCard';
import { supabase } from '../../lib/supabase';
import { PRODUCT_SELECT } from '../../lib/products';
import type { Product } from '../../types';
import PageMeta from '../../components/PageMeta';

interface Collection {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    content: string | null;
    cover_image_url: string | null;
    tag: string | null;
    is_active: boolean;
}

// 本文の記法: `# 大見出し` / `## 見出し` / `![alt](url)`。
// 管理画面で「##見出し」のようにスペース無しで書かれても見出しとして扱う
function renderContent(text: string) {
    return text.split('\n').map((line, i) => {
        const h2 = line.match(/^##\s*(.+)$/);
        if (h2) return <h2 key={i}>{h2[1].trim()}</h2>;
        const h1 = line.match(/^#\s*(.+)$/);
        if (h1) return <h2 key={i}>{h1[1].trim()}</h2>;
        if (line.trim() === '') return null;
        const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} loading="lazy" />;
        return <p key={i}>{line}</p>;
    });
}

export default function FeatureDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [recommended, setRecommended] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            const [colRes, cpRes, recRes] = await Promise.all([
                supabase
                    .from('collections')
                    .select('*')
                    .eq('id', id)
                    .eq('is_active', true)
                    .single(),
                supabase
                    .from('collection_products')
                    .select(`sort_order, product:products(${PRODUCT_SELECT})`)
                    .eq('collection_id', id)
                    .order('sort_order', { ascending: true }),
                supabase
                    .from('recommended_products')
                    .select(`sort_order, product:products(${PRODUCT_SELECT})`)
                    .eq('collection_id', id)
                    .order('sort_order', { ascending: true }),
            ]);

            if (colRes.error || !colRes.data) {
                navigate('/features');
                return;
            }
            setCollection(colRes.data);
            // draft・hidden の商品は特集内でも公開しない
            const isPublic = (p: any) => p && ['published', 'reserved', 'sold_out'].includes(p.status);
            setProducts((cpRes.data || []).map((cp: any) => cp.product).filter(isPublic));
            setRecommended((recRes.data || []).map((r: any) => r.product).filter(isPublic));
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!collection) return null;

    return (
        <div className="min-h-screen bg-white">
            <PageMeta
                title={collection.title}
                description={collection.description || collection.subtitle || collection.title}
                image={collection.cover_image_url || undefined}
                path={`/features/${collection.id}`}
            />
            <Navigation />

            <main className="page">
                <div className="shop-container">
                    {/* 見出し: 写真の上に文字を重ねず、写真と見出しを分ける */}
                    <header className="page-header page-header-left !pt-10 !pb-8">
                        <Link to="/features" className="shop-text-link mb-8">特集・読みもの</Link>
                        <p className="shop-eyebrow mt-8">{collection.tag || 'Journal'}</p>
                        <h1>{collection.title}</h1>
                        {collection.subtitle && <p className="page-header-lead">{collection.subtitle}</p>}
                    </header>
                    {collection.cover_image_url && (
                        <div className="aspect-[21/9] overflow-hidden bg-[color:var(--rp-photo-bg)]">
                            <img src={collection.cover_image_url} alt={collection.title} className="w-full h-full object-cover" fetchPriority="high" />
                        </div>
                    )}

                    {/* 本文 */}
                    {(collection.content || collection.description) && (
                        <article className="rp-article max-w-[40em] mx-auto py-16">
                            {collection.content ? renderContent(collection.content) : <p>{collection.description}</p>}
                        </article>
                    )}

                    {/* 特集の犬服 */}
                    <section className="page-section">
                        <div className="shop-section-heading">
                            <div><p className="shop-eyebrow">Items</p><h2>この特集の犬服</h2><p>{products.length}点</p></div>
                        </div>
                        {products.length === 0 ? (
                            <p className="py-16 text-center text-sm text-[color:var(--rp-muted)]">現在、犬服の登録がありません。</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
                                {products.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                        )}
                    </section>

                    {/* おすすめ商品 */}
                    {recommended.length > 0 && (
                        <section className="page-section">
                            <div className="shop-section-heading">
                                <div><p className="shop-eyebrow">Recommended</p><h2>あわせておすすめ</h2></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
                                {recommended.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                        </section>
                    )}

                    <div className="shop-section-more !mt-0 pb-24">
                        <Link to="/features" className="rp-btn rp-btn-outline">特集一覧へ</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
