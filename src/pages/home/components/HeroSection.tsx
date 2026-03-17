import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* 背景動画 */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://public.readdy.ai/ai/video_res/f0ac08c5-d36c-4e86-b0fd-62e0ee9c23b1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
      </div>

      {/* コンテンツ */}
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
