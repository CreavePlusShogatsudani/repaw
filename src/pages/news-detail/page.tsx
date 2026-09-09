import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { supabase } from '../../lib/supabase';
import PageMeta from '../../components/PageMeta';

interface NewsArticle {
    id: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    thumbnail_url: string | null;
    category: string;
    published_at: string;
}

// 本文の記法: `# 大見出し` / `## 見出し` / `![alt](url)`。特集と同じルール。
// 「##見出し」のようにスペース無しで書かれても見出しとして扱う
function renderContent(text: string) {
    return text.split('\n').map((line, i) => {
        const h2 = line.match(/^##\s*(.+)$/);
        if (h2) return <h2 key={i}>{h2[1].trim()}</h2>;
        const h1 = line.match(/^#\s*(.+)$/);
        if (h1) return <h2 key={i}>{h1[1].trim()}</h2>;
        if (line.trim() === '') return null;
        const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} loading="lazy" />;
        return <p key={i}>{line}</p>;
    });
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
            setRelatedNews((listRes.data as NewsArticle[]) || []);
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

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: news.title,
        description: news.excerpt || undefined,
        image: news.thumbnail_url || undefined,
        datePublished: news.published_at,
        publisher: {
            '@type': 'Organization',
            name: 'RePaw',
            url: 'https://repaw-pi.vercel.app',
        },
    };

    return (
        <div className="min-h-screen bg-white">
            <PageMeta
                title={news.title}
                description={news.excerpt || news.title}
                image={news.thumbnail_url || undefined}
                path={`/news/${news.id}`}
                type="article"
                jsonLd={articleJsonLd}
            />
            <Navigation />

            <main className="page">
                <div className="shop-container">
                    <article className="max-w-[44em] mx-auto pt-12 pb-24">
                        <Link to="/news" className="shop-text-link">お知らせ一覧</Link>

                        <header className="mt-10 pb-8 border-b border-[color:var(--rp-line)]">
                            <div className="flex items-center gap-4">
                                <time dateTime={news.published_at} className="text-xs tracking-[.04em] text-[color:var(--rp-muted)]">{formatDate(news.published_at)}</time>
                                <span className="rp-badge">{news.category}</span>
                            </div>
                            <h1 className="mt-4 text-[26px] md:text-[34px] font-medium tracking-[.06em] leading-[1.5]">{news.title}</h1>
                            {news.excerpt && <p className="mt-4 text-sm leading-7 text-[color:var(--rp-muted)]">{news.excerpt}</p>}
                        </header>

                        {news.thumbnail_url && (
                            <div className="mt-10 aspect-[16/9] overflow-hidden bg-[color:var(--rp-photo-bg)]">
                                <img src={news.thumbnail_url} alt={news.title} className="w-full h-full object-cover" fetchPriority="high" />
                            </div>
                        )}

                        <div className="rp-article mt-10">
                            {news.content ? renderContent(news.content) : null}
                        </div>
                    </article>

                    {relatedNews.length > 0 && (
                        <section className="page-section pb-24">
                            <div className="shop-section-heading">
                                <div><p className="shop-eyebrow">More</p><h2>ほかのお知らせ</h2></div>
                                <Link to="/news" className="shop-text-link">すべて見る</Link>
                            </div>
                            <div>
                                {relatedNews.map(item => (
                                    <Link key={item.id} to={`/news/${item.id}`} className="group grid grid-cols-[110px_1fr] md:grid-cols-[140px_110px_1fr] items-center gap-x-6 gap-y-2 py-5 border-b border-[color:var(--rp-line)]">
                                        <time dateTime={item.published_at} className="text-xs tracking-[.04em] text-[color:var(--rp-muted)]">{formatDate(item.published_at)}</time>
                                        <span className="rp-badge justify-self-start">{item.category}</span>
                                        <h3 className="col-span-2 md:col-span-1 text-sm font-medium leading-relaxed group-hover:underline underline-offset-4">{item.title}</h3>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
