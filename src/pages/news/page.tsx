import { Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import { useState, useEffect } from 'react';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';

interface NewsArticle {
    id: string;
    title: string;
    excerpt: string | null;
    thumbnail_url: string | null;
    category: string;
    published_at: string;
}

const CATEGORIES = ['すべて', 'お知らせ', '寄付報告', '新商品', 'イベント'];

export default function NewsPage() {
    const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('すべて');

    useEffect(() => {
        supabase
            .from('news_articles')
            .select('id, title, excerpt, thumbnail_url, category, published_at')
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .then(({ data }) => {
                setNewsItems(data || []);
                setLoading(false);
            });
    }, []);

    const filtered = selectedCategory === 'すべて'
        ? newsItems
        : newsItems.filter(n => n.category === selectedCategory);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

    return (
        <div className="min-h-screen bg-white">
            <PageMeta title="ニュース・お知らせ" description="RePawからの最新情報・お知らせ・イベント情報をお届けします。" path="/news" />
      <Navigation />

            <div className="pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>News</h1>
                        <p className="text-gray-600 text-lg">お知らせ一覧</p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center mb-12">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">記事がありません</div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map(news => (
                                <Link key={news.id} to={`/news/${news.id}`} className="group cursor-pointer">
                                    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                        {news.thumbnail_url ? (
                                            <img
                                                src={news.thumbnail_url}
                                                alt={news.title}
                                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <i className="ri-newspaper-line text-4xl"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-sm text-gray-500">{formatDate(news.published_at)}</span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full whitespace-nowrap">
                                            {news.category}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:underline">{news.title}</h3>
                                    {news.excerpt && <p className="text-sm text-gray-600 line-clamp-2">{news.excerpt}</p>}
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
