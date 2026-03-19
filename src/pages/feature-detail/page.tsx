import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';

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

function renderContent(text: string) {
    return text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.slice(3)}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-10 mb-4">{line.slice(2)}</h1>;
        if (line === '') return <div key={i} className="h-4" />;
        return <p key={i} className="leading-relaxed text-gray-700">{line}</p>;
    });
}

export default function FeatureDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            const [colRes, cpRes] = await Promise.all([
                supabase
                    .from('collections')
                    .select('*')
                    .eq('id', id)
                    .eq('is_active', true)
                    .single(),
                supabase
                    .from('collection_products')
                    .select('sort_order, product:products(*)')
                    .eq('collection_id', id)
                    .order('sort_order', { ascending: true }),
            ]);

            if (colRes.error || !colRes.data) {
                navigate('/features');
                return;
            }
            setCollection(colRes.data);
            const prods = (cpRes.data || []).map((cp: any) => cp.product).filter(Boolean);
            setProducts(prods);
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
            <Navigation />

            {/* Hero */}
            <div className="relative h-96 bg-gray-200 overflow-hidden">
                {collection.cover_image_url ? (
                    <img
                        src={collection.cover_image_url}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-end pb-12 px-6">
                    <div className="max-w-7xl mx-auto w-full">
                        {collection.tag && (
                            <span className="inline-block px-3 py-1 bg-white text-black text-xs font-bold rounded-full mb-3">
                                {collection.tag}
                            </span>
                        )}
                        {collection.subtitle && (
                            <p className="text-white/70 text-sm tracking-wider mb-2">{collection.subtitle}</p>
                        )}
                        <h1 className="text-4xl md:text-5xl font-bold text-white">{collection.title}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Description / Content */}
                {(collection.content || collection.description) && (
                    <div className="max-w-2xl mb-12">
                        {collection.content ? (
                            <div className="text-base space-y-2">{renderContent(collection.content)}</div>
                        ) : (
                            <p className="text-gray-700 leading-relaxed text-lg">{collection.description}</p>
                        )}
                    </div>
                )}

                {/* Products */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        このグループの商品
                        <span className="ml-3 text-lg font-normal text-gray-500">{products.length}点</span>
                    </h2>
                    <Link to="/features" className="text-sm text-gray-500 hover:text-gray-700">
                        ← 特集一覧に戻る
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <i className="ri-shopping-bag-line text-5xl mb-4 block"></i>
                        現在商品が登録されていません
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => {
                            const thumb = product.images?.[0];
                            const discount = product.original_price
                                ? Math.round((1 - product.price / product.original_price) * 100)
                                : null;
                            return (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="group"
                                >
                                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                                        {thumb ? (
                                            <img
                                                src={thumb}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <i className="ri-image-line text-4xl"></i>
                                            </div>
                                        )}
                                        {discount && discount > 0 && (
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold">
                                                    -{discount}%
                                                </span>
                                            </div>
                                        )}
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">SOLD OUT</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2 group-hover:underline line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-base font-bold">¥{(product.price ?? 0).toLocaleString()}</span>
                                        {product.original_price && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ¥{(product.original_price ?? 0).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
