import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface Collection {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    tag: string | null;
    sort_order: number;
    is_active: boolean;
    product_count?: number;
}

export default function AdminCollectionsPage() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('collections')
            .select('*, collection_products(count)')
            .order('sort_order', { ascending: true });
        if (error) console.error(error);
        const mapped = (data || []).map((c: any) => ({
            ...c,
            product_count: c.collection_products?.[0]?.count ?? 0,
        }));
        setCollections(mapped);
        setLoading(false);
    };

    const toggleActive = async (c: Collection) => {
        const { error } = await supabase
            .from('collections')
            .update({ is_active: !c.is_active, updated_at: new Date().toISOString() })
            .eq('id', c.id);
        if (error) { alert('更新に失敗しました。'); return; }
        await fetchCollections();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('この特集を削除しますか？（商品の紐づけも削除されます）')) return;
        const { error } = await supabase.from('collections').delete().eq('id', id);
        if (error) { alert('削除に失敗しました。'); return; }
        await fetchCollections();
    };

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= collections.length) return;
        const a = collections[index];
        const b = collections[swapIndex];
        await supabase.from('collections').update({ sort_order: b.sort_order }).eq('id', a.id);
        await supabase.from('collections').update({ sort_order: a.sort_order }).eq('id', b.id);
        await fetchCollections();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">特集管理</h1>
                <Link
                    to="/admin/collections/new"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors"
                >
                    <i className="ri-add-line"></i>特集を作成
                </Link>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                特集ページの記事を管理します。各特集に商品を紐づけることができます。
            </p>

            {collections.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                    <i className="ri-folder-line text-4xl mb-3 block text-gray-300"></i>
                    特集がまだ作成されていません
                </div>
            ) : (
                <div className="space-y-4">
                    {collections.map((c, index) => (
                        <div key={c.id} className={`bg-white rounded-lg shadow overflow-hidden flex ${!c.is_active ? 'opacity-60' : ''}`}>
                            {/* Cover Image */}
                            <div className="w-40 h-28 flex-shrink-0 bg-gray-100">
                                {c.cover_image_url ? (
                                    <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <i className="ri-image-line text-3xl"></i>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-4 min-w-0">
                                <div className="flex items-start gap-2 mb-1">
                                    {c.tag && (
                                        <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-200 flex-shrink-0">
                                            {c.tag}
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {c.is_active ? '公開中' : '非公開'}
                                    </span>
                                </div>
                                <p className="font-medium text-gray-900">{c.title}</p>
                                {c.subtitle && <p className="text-xs text-gray-500 mt-0.5">{c.subtitle}</p>}
                                <p className="text-sm text-orange-600 font-medium mt-1">{c.product_count}点の商品</p>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <Link
                                        to={`/admin/collections/${c.id}/edit`}
                                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    >
                                        <i className="ri-edit-line mr-1"></i>記事を編集
                                    </Link>
                                    <Link
                                        to={`/admin/collections/${c.id}`}
                                        className="text-xs px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium transition-colors"
                                    >
                                        <i className="ri-shopping-bag-line mr-1"></i>商品を管理
                                    </Link>
                                    <Link
                                        to={`/admin/collections/${c.id}/recommended`}
                                        className="text-xs px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium transition-colors"
                                    >
                                        <i className="ri-star-line mr-1"></i>おすすめ商品
                                    </Link>
                                    <button
                                        onClick={() => toggleActive(c)}
                                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    >
                                        {c.is_active ? '非公開にする' : '公開する'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                    >
                                        <i className="ri-delete-bin-line mr-1"></i>削除
                                    </button>
                                    <div className="ml-auto flex gap-1">
                                        <button onClick={() => moveOrder(index, 'up')} disabled={index === 0}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <i className="ri-arrow-up-s-line text-lg"></i>
                                        </button>
                                        <button onClick={() => moveOrder(index, 'down')} disabled={index === collections.length - 1}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <i className="ri-arrow-down-s-line text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
