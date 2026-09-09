import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface NewsArticle {
    id: string;
    title: string;
    excerpt: string | null;
    thumbnail_url: string | null;
    category: string;
    published_at: string;
}

export default function NewsSection() {
    const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);

    useEffect(() => {
        supabase
            .from('news_articles')
            .select('id, title, excerpt, thumbnail_url, category, published_at')
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .limit(4)
            .then(({ data }) => {
                if (data && data.length > 0) setNewsItems(data);
            });
    }, []);

    if (newsItems.length === 0) return null;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

    return (
        <section className="shop-container shop-section shop-news">
            <div className="shop-section-heading">
                <div><p className="shop-eyebrow">News</p><h2>お店からのお知らせ</h2></div>
                <Link to="/news" className="shop-text-link">すべて見る <span aria-hidden="true">→</span></Link>
            </div>
            <div>
                {newsItems.map(news => (
                    <Link key={news.id} to={`/news/${news.id}`} className="shop-news-row group">
                        <time dateTime={news.published_at}>{formatDate(news.published_at)}</time>
                        <span className="text-xs text-stone-600">{news.category}</span>
                        <h3 className="text-sm font-medium group-hover:underline underline-offset-4">{news.title}</h3>
                        <span aria-hidden="true">→</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
