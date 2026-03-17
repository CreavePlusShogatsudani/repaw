import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Link } from 'react-router-dom';

type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    status: string;
    created_at: string;
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('id, name, price, stock, status, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            alert('商品の取得に失敗しました。');
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('本当にこの商品を削除しますか？')) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            alert('商品の削除に失敗しました。');
        } else {
            alert('商品を削除しました。');
            fetchProducts();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">商品管理</h1>
                <Link
                    to="/admin/products/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <i className="ri-add-line mr-2"></i>
                    新規登録
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                <th className="p-4 font-medium">商品名</th>
                                <th className="p-4 font-medium">価格</th>
                                <th className="p-4 font-medium">在庫数</th>
                                <th className="p-4 font-medium">ステータス</th>
                                <th className="p-4 font-medium">登録日</th>
                                <th className="p-4 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        読み込み中...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        商品がありません。
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-4 text-sm font-medium text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            ¥{product.price.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {product.stock}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {product.status === 'published' ? '公開中' : '非公開'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/admin/products/${product.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="編集"
                                                >
                                                    <i className="ri-edit-line"></i>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="削除"
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
