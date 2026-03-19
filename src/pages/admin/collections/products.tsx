import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import type { Product } from '../../../types';

interface CollectionProduct {
    id: string;
    product_id: string;
    sort_order: number;
    product: Product;
}

interface Collection {
    id: string;
    title: string;
}

export default function AdminCollectionProductsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [collection, setCollection] = useState<Collection | null>(null);
    const [collectionProducts, setCollectionProducts] = useState<CollectionProduct[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        const [colRes, cpRes, prodRes] = await Promise.all([
            supabase.from('collections').select('id, title').eq('id', id!).single(),
            supabase
                .from('collection_products')
                .select('id, product_id, sort_order, product:products(*)')
                .eq('collection_id', id!)
                .order('sort_order', { ascending: true }),
            supabase
                .from('products')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false }),
        ]);
        if (colRes.error || !colRes.data) {
            alert('コレクションが見つかりません。');
            navigate('/admin/collections');
            return;
        }
        setCollection(colRes.data);
        setCollectionProducts((cpRes.data || []) as CollectionProduct[]);
        setAllProducts(prodRes.data || []);
        setLoading(false);
    };

    const addedProductIds = new Set(collectionProducts.map(cp => cp.product_id));

    const filteredProducts = allProducts.filter(p => {
        if (addedProductIds.has(p.id)) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    });

    const handleAdd = async (product: Product) => {
        if (adding) return;
        setAdding(true);
        const maxOrder = collectionProducts.length > 0
            ? Math.max(...collectionProducts.map(cp => cp.sort_order)) + 1 : 0;
        const { error } = await supabase.from('collection_products').insert({
            collection_id: id,
            product_id: product.id,
            sort_order: maxOrder,
        });
        if (error) {
            alert('追加に失敗しました: ' + error.message);
        } else {
            await fetchData();
        }
        setAdding(false);
    };

    const handleRemove = async (cpId: string) => {
        if (!confirm('この商品をグループから削除しますか？')) return;
        const { error } = await supabase.from('collection_products').delete().eq('id', cpId);
        if (error) { alert('削除に失敗しました。'); return; }
        await fetchData();
    };

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= collectionProducts.length) return;
        const a = collectionProducts[index];
        const b = collectionProducts[swapIndex];
        await supabase.from('collection_products').update({ sort_order: b.sort_order }).eq('id', a.id);
        await supabase.from('collection_products').update({ sort_order: a.sort_order }).eq('id', b.id);
        await fetchData();
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
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/collections" className="text-gray-400 hover:text-gray-700">
                    <i className="ri-arrow-left-line text-xl"></i>
                </Link>
                <div>
                    <p className="text-xs text-gray-500">おすすめ商品グループ管理</p>
                    <h1 className="text-2xl font-bold text-gray-900">{collection?.title}</h1>
                </div>
                <button
                    onClick={() => setShowPicker(true)}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors"
                >
                    <i className="ri-add-line"></i>商品を追加
                </button>
            </div>

            {/* Registered Products */}
            {collectionProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                    <i className="ri-shopping-bag-line text-4xl mb-3 block text-gray-300"></i>
                    <p>まだ商品が追加されていません</p>
                    <button
                        onClick={() => setShowPicker(true)}
                        className="mt-4 px-6 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700"
                    >
                        商品を追加する
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {collectionProducts.map((cp, index) => {
                        const p = cp.product;
                        const thumb = p.images?.[0];
                        return (
                            <div key={cp.id} className="bg-white rounded-lg shadow flex items-center p-4 gap-4">
                                {/* Thumb */}
                                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                    {thumb ? (
                                        <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <i className="ri-image-line text-xl"></i>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{p.name}</p>
                                    <p className="text-sm text-gray-500">
                                        ¥{(p.price ?? 0).toLocaleString()}
                                        {p.category && <span className="ml-2 text-xs text-gray-400">{p.category}</span>}
                                        {p.size && <span className="ml-2 text-xs text-gray-400">サイズ: {p.size}</span>}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => moveOrder(index, 'up')} disabled={index === 0}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                                        <i className="ri-arrow-up-s-line text-lg"></i>
                                    </button>
                                    <button onClick={() => moveOrder(index, 'down')} disabled={index === collectionProducts.length - 1}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                                        <i className="ri-arrow-down-s-line text-lg"></i>
                                    </button>
                                    <button
                                        onClick={() => handleRemove(cp.id)}
                                        className="p-1.5 text-red-400 hover:text-red-600 ml-2"
                                        title="グループから削除"
                                    >
                                        <i className="ri-delete-bin-line text-lg"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Product Picker Modal */}
            {showPicker && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold">商品を選択</h2>
                            <button onClick={() => { setShowPicker(false); setSearchQuery(''); }}
                                className="text-gray-400 hover:text-gray-700">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b">
                            <div className="relative">
                                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="商品名・カテゴリで検索"
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="overflow-y-auto flex-1 p-4">
                            {filteredProducts.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">
                                    {searchQuery ? '検索結果がありません' : '追加できる商品がありません'}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {filteredProducts.map(p => {
                                        const thumb = p.images?.[0];
                                        return (
                                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                                                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                                    {thumb ? (
                                                        <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <i className="ri-image-line"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        ¥{(p.price ?? 0).toLocaleString()}
                                                        {p.category && <span className="ml-2">{p.category}</span>}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleAdd(p)}
                                                    disabled={adding}
                                                    className="flex-shrink-0 px-3 py-1.5 bg-gray-900 text-white text-xs hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                                >
                                                    追加
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 text-sm text-gray-500">
                            {filteredProducts.length}点の商品が追加できます
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
