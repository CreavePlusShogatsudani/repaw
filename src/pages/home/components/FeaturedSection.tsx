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
        <section className="py-24 px-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Featured</h2>
                    <p className="text-gray-600 text-sm tracking-wider">特集</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {collections.map((c) => (
                        <Link
                            key={c.id}
                            to={`/features/${c.id}`}
                            className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="w-full h-96 bg-gray-100 overflow-hidden">
                                {c.cover_image_url ? (
                                    <img
                                        src={c.cover_image_url}
                                        alt={c.title}
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <i className="ri-image-line text-5xl"></i>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                {c.subtitle && <p className="text-xs text-gray-500 mb-2 tracking-wider">{c.subtitle}</p>}
                                <h3 className="text-xl font-bold mb-3 group-hover:underline">{c.title}</h3>
                                {c.description && <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/features"
                        className="inline-block px-8 py-3 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                    >
                        すべての特集を見る
                    </Link>
                </div>
            </div>
        </section>
    );
}
