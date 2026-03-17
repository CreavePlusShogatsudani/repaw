import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getNews } from '../../../lib/microcms';
import type { News } from '../../../types/microcms';

export default function NewsSection() {
  const [newsItems, setNewsItems] = useState<News[]>([]);

  useEffect(() => {
    getNews({ limit: 4 })
      .then(({ contents }) => setNewsItems(contents))
      .catch(() => setNewsItems([]));
  }, []);

  if (newsItems.length === 0) return null;

  return (
    <section className="bg-gray-600 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-2 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>News</h2>
            <p className="text-gray-300 text-sm tracking-wider">お知らせ</p>
          </div>
          <Link to="/news" className="px-6 py-2 border-2 border-white text-white text-sm font-medium hover:bg-white hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer">
            すべて見る
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {newsItems.map((news) => {
            const date = new Date(news.publishedAt).toLocaleDateString('ja-JP', {
              year: 'numeric', month: '2-digit', day: '2-digit'
            }).replace(/\//g, '.');
            return (
              <Link key={news.id} to={`/news/${news.id}`} className="group cursor-pointer flex gap-4">
                <div className="w-32 h-24 flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden">
                  {news.thumbnail && (
                    <img
                      src={news.thumbnail.url}
                      alt={news.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-300">{date}</span>
                    <span className="px-3 py-1 bg-gray-700 text-gray-200 text-xs font-medium rounded-full whitespace-nowrap">
                      {news.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-1 text-white group-hover:underline">{news.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-2">{news.excerpt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
