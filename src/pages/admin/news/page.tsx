import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface NewsArticle {
    id: string;
    title: string;
    category: string;
    is_published: boolean;
    published_at: string;
    thumbnail_url: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
    'お知らせ': 'bg-blue-100 text-blue-700',
    '寄付報告': 'bg-green-100 text-green-700',
    '新商品': 'bg-orange-100 text-orange-700',
    'イベント': 'bg-purple-100 text-purple-700',
};

export default function AdminNewsPage() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('news_articles')
            .select('id, title, category, is_published, published_at, thumbnail_url')
            .order('published_at', { ascending: false });
        if (error) console.error(error);
        setArticles(data || []);
        setLoading(false);
    };

    const togglePublish = async (article: NewsArticle) => {
        const { error } = await supabase
            .from('news_articles')
            .update({ is_published: !article.is_published, updated_at: new Date().toISOString() })
            .eq('id', article.id);
        if (error) { alert('更新に失敗しました。'); return; }
        await fetchArticles();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('この記事を削除しますか？')) return;
        const { error } = await supabase.from('news_articles').delete().eq('id', id);
        if (error) { alert('削除に失敗しました。'); return; }
        await fetchArticles();
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

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
                <h1 className="text-2xl font-bold text-gray-900">ニュース管理</h1>
                <Link
                    to="/admin/news/new"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors"
                >
                    <i className="ri-add-line"></i>記事を作成
                </Link>
            </div>

            {articles.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                    <i className="ri-newspaper-line text-4xl mb-3 block text-gray-300"></i>
                    記事がまだありません
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">記事</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">カテゴリ</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">公開日</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {articles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                                {article.thumbnail_url ? (
                                                    <img src={article.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <i className="ri-image-line"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900 line-clamp-2">{article.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-600'}`}>
                                            {article.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-gray-500 hidden md:table-cell whitespace-nowrap">
                                        {formatDate(article.published_at)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => togglePublish(article)}
                                            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                                article.is_published
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                        >
                                            {article.is_published ? '公開中' : '下書き'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={() => navigate(`/admin/news/${article.id}/edit`)}
                                                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                                                title="編集"
                                            >
                                                <i className="ri-edit-line text-lg"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="削除"
                                            >
                                                <i className="ri-delete-bin-line text-lg"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
