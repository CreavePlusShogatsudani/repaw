import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';

interface NewsArticle {
    id: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    thumbnail_url: string | null;
    category: string;
    published_at: string;
}

// "## 見出し" を <h2> に、それ以外は段落として描画するシンプルなレンダラー
function renderContent(text: string) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith('## ')) {
            elements.push(
                <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.slice(3)}</h2>
            );
            i++;
        } else if (line.startsWith('# ')) {
            elements.push(
                <h1 key={i} className="text-3xl font-bold mt-10 mb-4">{line.slice(2)}</h1>
            );
            i++;
        } else if (line === '') {
            elements.push(<div key={i} className="h-4" />);
            i++;
        } else {
            elements.push(
                <p key={i} className="leading-relaxed text-gray-700">{line}</p>
            );
            i++;
        }
    }
    return elements;
}

export default function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [news, setNews] = useState<NewsArticle | null>(null);
    const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            const [detailRes, listRes] = await Promise.all([
                supabase
                    .from('news_articles')
                    .select('*')
                    .eq('id', id)
                    .eq('is_published', true)
                    .single(),
                supabase
                    .from('news_articles')
                    .select('id, title, thumbnail_url, category, published_at, excerpt')
                    .eq('is_published', true)
                    .neq('id', id)
                    .order('published_at', { ascending: false })
                    .limit(3),
            ]);
            if (detailRes.error || !detailRes.data) {
                navigate('/news');
                return;
            }
            setNews(detailRes.data);
            setRelatedNews(listRes.data || []);
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navigation />
                <div className="pt-32 pb-24 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!news) return null;

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <div className="pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link to="/news" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8">
                        <i className="ri-arrow-left-line"></i>
                        お知らせ一覧に戻る
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm text-gray-500">{formatDate(news.published_at)}</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full whitespace-nowrap">
                            {news.category}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {news.title}
                    </h1>

                    {news.thumbnail_url && (
                        <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-12">
                            <img src={news.thumbnail_url} alt={news.title} className="w-full h-full object-cover object-top" />
                        </div>
                    )}

                    {/* Content */}
                    {news.content ? (
                        <div className="text-base space-y-2">
                            {renderContent(news.content)}
                        </div>
                    ) : news.excerpt ? (
                        <p className="text-gray-700 leading-relaxed text-lg">{news.excerpt}</p>
                    ) : null}

                    {/* Related */}
                    {relatedNews.length > 0 && (
                        <div className="mt-16 pt-12 border-t border-gray-200">
                            <h2 className="text-2xl font-bold mb-8">関連するお知らせ</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedNews.map(item => (
                                    <Link key={item.id} to={`/news/${item.id}`} className="group">
                                        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <i className="ri-newspaper-line text-3xl"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-gray-500">{formatDate(item.published_at)}</span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full whitespace-nowrap">
                                                {item.category}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold group-hover:underline line-clamp-2">{item.title}</h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
