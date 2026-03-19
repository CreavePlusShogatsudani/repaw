import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface HeroBanner {
    id: string;
    title: string | null;
    subtitle: string | null;
    image_url: string;
    link_url: string | null;
    link_text: string | null;
    sort_order: number;
    is_active: boolean;
}

export default function HeroSection() {
    const navigate = useNavigate();
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        supabase
            .from('hero_banners')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .then(({ data }) => {
                if (data && data.length > 0) setBanners(data);
                setLoaded(true);
            });
    }, []);

    // 複数バナーの自動スライド
    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(i => (i + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const current = banners[currentIndex];

    // 読み込み完了前は何も表示しない
    if (!loaded) {
        return <section className="h-dvh bg-gray-900" />;
    }

    // バナーが登録されている場合
    if (banners.length > 0 && current) {
        return (
            <section className="relative h-dvh flex items-center justify-center overflow-hidden">
                {/* バナー画像 */}
                {banners.map((banner, i) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={banner.image_url}
                            alt={banner.title || ''}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
                    </div>
                ))}

                {/* コンテンツ */}
                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full">
                    {current.title && (
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            {current.title}
                        </h1>
                    )}
                    {current.subtitle && (
                        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                            {current.subtitle}
                        </p>
                    )}

                    {current.link_url && current.link_text && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate(current.link_url!)}
                                className="px-8 py-4 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                {current.link_text}
                            </button>
                        </div>
                    )}
                </div>

                {/* ドットインジケーター (複数の場合のみ) */}
                {banners.length > 1 && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}

                {/* スクロールインジケーター */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-col items-center gap-2 animate-bounce">
                        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-2">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-xs text-white/80 font-light tracking-wider">SCROLL</span>
                    </div>
                </div>
            </section>
        );
    }

    // バナー未登録時はシンプルな静的背景
    return (
        <section className="relative h-dvh flex items-center justify-center overflow-hidden bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>

            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    リユースで未来を創る
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                    使わなくなった犬服を買い取り、新しい飼い主へ。<br />
                    あなたの選択が、持続可能な社会を実現します。
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="px-8 py-4 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
                    >
                        製品を見る
                    </button>
                    <button
                        onClick={() => navigate('/system')}
                        className="px-8 py-4 border-2 border-white text-white text-sm font-medium hover:bg-white hover:text-black transition-colors whitespace-nowrap cursor-pointer"
                    >
                        買取について
                    </button>
                </div>
            </div>

            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="flex flex-col items-center gap-2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs text-white/80 font-light tracking-wider">SCROLL</span>
                </div>
            </div>
        </section>
    );
}
