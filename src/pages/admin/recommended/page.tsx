import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface RecommendedProduct {
    id: string;
    product_id: string;
    sort_order: number;
    product: {
        id: string;
        name: string;
        price: number;
        images: string[] | null;
        category: string;
        status: string;
    } | null;
}

function extractProductId(input: string): string | null {
    // /product/UUID  or  full URL containing /product/UUID
    const match = input.match(/\/product\/([0-9a-f-]{36})/i);
    if (match) return match[1];
    // bare UUID
    const uuidMatch = input.trim().match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    if (uuidMatch) return input.trim();
    return null;
}

export default function AdminRecommendedPage() {
    const [items, setItems] = useState<RecommendedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [urlInput, setUrlInput] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('recommended_products')
            .select('id, product_id, sort_order, product:products(id, name, price, images, category, status)')
            .order('sort_order', { ascending: true });
        if (error) console.error(error);
        setItems((data as any) || []);
        setLoading(false);
    };

    const handleAdd = async () => {
        setError(null);
        const productId = extractProductId(urlInput);
        if (!productId) {
            setError('商品URLまたは商品IDを正しく入力してください（例: /product/xxxx）');
            return;
        }

        // 重複チェック
        if (items.some(i => i.product_id === productId)) {
            setError('この商品はすでに登録されています。');
            return;
        }

        setAdding(true);
        // 商品の存在確認
        const { data: prod, error: prodErr } = await supabase
            .from('products')
            .select('id, name')
            .eq('id', productId)
            .single();
        if (prodErr || !prod) {
            setError('商品が見つかりませんでした。URLを確認してください。');
            setAdding(false);
            return;
        }

        const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;
        const { error: insertErr } = await supabase
            .from('recommended_products')
            .insert({ product_id: productId, sort_order: nextOrder });
        if (insertErr) {
            setError('登録に失敗しました: ' + insertErr.message);
            setAdding(false);
            return;
        }

        setUrlInput('');
        setAdding(false);
        await fetchItems();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('削除しますか？')) return;
        await supabase.from('recommended_products').delete().eq('id', id);
        await fetchItems();
    };

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= items.length) return;
        const a = items[index];
        const b = items[swapIndex];
        await supabase.from('recommended_products').update({ sort_order: b.sort_order }).eq('id', a.id);
        await supabase.from('recommended_products').update({ sort_order: a.sort_order }).eq('id', b.id);
        await fetchItems();
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">おすすめ商品管理</h1>
                <p className="text-sm text-gray-500 mt-1">
                    特集記事ページに表示される「おすすめ商品」を管理します。商品URLを入力して追加してください。
                </p>
            </div>

            {/* 追加フォーム */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">商品を追加</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={urlInput}
                        onChange={e => { setUrlInput(e.target.value); setError(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        placeholder="例: /product/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || !urlInput.trim()}
                        className="px-5 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {adding ? '追加中...' : '追加'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                <p className="text-xs text-gray-400 mt-2">
                    商品ページのURLをそのまま貼り付けるか、商品IDを入力してください
                </p>
            </div>

            {/* 一覧 */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
                    <i className="ri-star-line text-4xl mb-3 block text-gray-200"></i>
                    おすすめ商品がまだ登録されていません
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={item.id} className="bg-white rounded-lg shadow flex items-center gap-4 p-4">
                            {/* 画像 */}
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                {item.product?.images?.[0] ? (
                                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <i className="ri-image-line text-xl"></i>
                                    </div>
                                )}
                            </div>

                            {/* 情報 */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{item.product?.name ?? '（商品が見つかりません）'}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-sm text-gray-500">¥{(item.product?.price ?? 0).toLocaleString()}</span>
                                    <span className="text-xs text-gray-400">{item.product?.category}</span>
                                    {item.product?.status === 'sold_out' && (
                                        <span className="text-xs text-red-500">売り切れ</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-300 mt-0.5 font-mono">/product/{item.product_id}</p>
                            </div>

                            {/* 操作 */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => moveOrder(index, 'up')} disabled={index === 0}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i className="ri-arrow-up-s-line text-lg"></i>
                                </button>
                                <button onClick={() => moveOrder(index, 'down')} disabled={index === items.length - 1}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i className="ri-arrow-down-s-line text-lg"></i>
                                </button>
                                <button onClick={() => handleDelete(item.id)}
                                    className="ml-2 p-1.5 text-red-400 hover:text-red-600">
                                    <i className="ri-delete-bin-line text-lg"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
