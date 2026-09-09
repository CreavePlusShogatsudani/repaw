import { Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
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

            <main className="page">
                <div className="shop-container pb-24">
                    <PageHeader eyebrow="News" title="お店からのお知らせ" lead="入荷や寄付の報告、イベントのご案内をお届けします。" />

                    <div className="rp-tabs mb-2" role="tablist">
                        {CATEGORIES.map(cat => (
                            <button key={cat} role="tab" aria-selected={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>{cat}</button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="py-16 text-sm text-[color:var(--rp-muted)]" role="status">読み込んでいます</div>
                    ) : filtered.length === 0 ? (
                        <p className="py-16 text-sm text-[color:var(--rp-muted)]">記事がありません。</p>
                    ) : (
                        <div>
                            {filtered.map(news => (
                                <Link key={news.id} to={`/news/${news.id}`} className="group grid grid-cols-[110px_1fr] md:grid-cols-[140px_110px_1fr_200px] items-center gap-x-6 gap-y-2 py-6 border-b border-[color:var(--rp-line)]">
                                    <time dateTime={news.published_at} className="text-xs tracking-[.04em] text-[color:var(--rp-muted)]">{formatDate(news.published_at)}</time>
                                    <span className="rp-badge justify-self-start">{news.category}</span>
                                    <div className="col-span-2 md:col-span-1">
                                        <h2 className="text-base font-medium leading-relaxed group-hover:underline underline-offset-4">{news.title}</h2>
                                        {news.excerpt && <p className="mt-1 text-sm text-[color:var(--rp-muted)] line-clamp-1">{news.excerpt}</p>}
                                    </div>
                                    {news.thumbnail_url && (
                                        <div className="hidden md:block aspect-[16/9] overflow-hidden bg-[color:var(--rp-photo-bg)]">
                                            <img src={news.thumbnail_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
