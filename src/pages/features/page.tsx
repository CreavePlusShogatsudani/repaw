import { useEffect, useState } from 'react';
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
            <Navigation />

            <div className="pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Features</h1>
                        <p className="text-gray-600 text-lg">特集一覧</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : collections.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            <i className="ri-folder-line text-5xl mb-4 block"></i>
                            現在公開中の特集はありません
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {collections.map((c) => (
                                <Link
                                    key={c.id}
                                    to={`/features/${c.id}`}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                        {c.cover_image_url ? (
                                            <img
                                                src={c.cover_image_url}
                                                alt={c.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <i className="ri-image-line text-5xl"></i>
                                            </div>
                                        )}
                                        {c.tag && (
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full">
                                                    {c.tag}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {c.subtitle && <p className="text-sm text-gray-500 mb-1">{c.subtitle}</p>}
                                    <h3 className="text-xl font-bold mb-2 group-hover:underline">{c.title}</h3>
                                    {c.description && <p className="text-sm text-gray-600 mb-3">{c.description}</p>}
                                    <p className="text-sm text-orange-600 font-medium">{c.product_count}点の商品</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
