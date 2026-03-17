import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { getNewsById, getNews } from '../../lib/microcms';
import type { News } from '../../types/microcms';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detail, list] = await Promise.all([
          getNewsById(id),
          getNews({ limit: 4 }),
        ]);
        setNews(detail);
        setRelatedNews(list.contents.filter((n) => n.id !== id).slice(0, 3));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-24 flex items-center justify-center">
          <p className="text-gray-400">読み込み中...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !news) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">お知らせが見つかりません</h1>
            <Link to="/news" className="text-orange-600 hover:underline">
              お知らせ一覧に戻る
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8"
          >
            <i className="ri-arrow-left-line"></i>
            <span>お知らせ一覧に戻る</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500">
              {formatDate(news.pubDate || news.publishedAt)}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full whitespace-nowrap">
              {news.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            {news.title}
          </h1>

          {news.thumbnail && (
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-12">
              <img
                src={news.thumbnail.url}
                alt={news.title}
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {relatedNews.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-8">関連するお知らせ</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Link key={item.id} to={`/news/${item.id}`} className="group">
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail.url}
                          alt={item.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(item.pubDate || item.publishedAt)}
                      </span>
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
