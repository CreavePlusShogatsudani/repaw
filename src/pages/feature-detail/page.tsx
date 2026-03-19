import { useParams, Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const FEATURE_DATA: Record<string, {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  content: {
    intro: string[];
    highlights: string[];
  };
  products: Array<{
    id: number;
    name: string;
    brand: string;
    price: number;
    originalPrice: number;
    size: string;
    condition: string;
    imageUrl: string;
  }>;
}> = {
  '1': {
    id: 1,
    title: '冬の新着コレクション',
    subtitle: 'Winter New Arrivals',
    description: '寒い季節にぴったりな、暖かくておしゃれな犬服が揃いました',
    imageUrl: 'https://readdy.ai/api/search-image?query=Elegant%20winter%20dog%20clothing%20collection%20photography%20featuring%20cozy%20knit%20sweaters%20warm%20coats%20and%20stylish%20jackets%20on%20clean%20white%20background%20with%20soft%20natural%20lighting%20neutral%20beige%20cream%20and%20brown%20color%20palette%20minimalist%20professional%20ecommerce%20style%20for%20premium%20pet%20fashion%20seasonal%20collection&width=1400&height=600&seq=wintercollection2024hero&orientation=landscape',
    content: {
      intro: [
        '寒い冬の季節、大切なワンちゃんを寒さから守る暖かくておしゃれな犬服が入荷しました。',
        '人気ブランドのニットセーター、ダウンジャケット、フリースコートなど、機能性とデザイン性を兼ね備えたアイテムを厳選してご用意しています。',
        'すべてリユース品ですが、状態の良いものばかりを取り揃えておりますので、安心してお選びいただけます。'
      ],
      highlights: [
        '暖かいニット素材のセーター',
        '防寒性抜群のダウンジャケット',
        '軽くて動きやすいフリースコート',
        '人気ブランドの冬物アイテム',
        'サイズ展開が豊富（XS〜XL）',
        '状態の良いリユース品のみ'
      ]
    },
    products: [
      {
        id: 101,
        name: 'ケーブルニットセーター',
        brand: 'RADICA',
        price: 3200,
        originalPrice: 6800,
        size: 'M',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Cozy%20cable%20knit%20dog%20sweater%20in%20cream%20beige%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20winter%20collection&width=400&height=500&seq=winter01&orientation=portrait'
      },
      {
        id: 102,
        name: 'ダウンジャケット',
        brand: 'iDog',
        price: 4500,
        originalPrice: 8900,
        size: 'L',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Warm%20quilted%20down%20jacket%20for%20dogs%20in%20brown%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20winter%20collection&width=400&height=500&seq=winter02&orientation=portrait'
      },
      {
        id: 103,
        name: 'フリースパーカー',
        brand: 'PUPPIA',
        price: 2800,
        originalPrice: 5400,
        size: 'S',
        condition: '良品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Soft%20fleece%20hoodie%20for%20dogs%20in%20neutral%20gray%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20winter%20collection&width=400&height=500&seq=winter03&orientation=portrait'
      },
      {
        id: 104,
        name: 'ボアコート',
        brand: 'Mandarine Brothers',
        price: 3800,
        originalPrice: 7200,
        size: 'M',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Fluffy%20sherpa%20fleece%20coat%20for%20dogs%20in%20cream%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20winter%20collection&width=400&height=500&seq=winter04&orientation=portrait'
      },
      {
        id: 105,
        name: 'タートルネックセーター',
        brand: 'Free Stitch',
        price: 2900,
        originalPrice: 5800,
        size: 'S',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Elegant%20turtleneck%20sweater%20for%20dogs%20in%20warm%20brown%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20winter%20collection&width=400&height=500&seq=winter05&orientation=portrait'
      },
      {
        id: 106,
        name: 'キルティングベスト',
        brand: 'RADICA',
        price: 3400,
        originalPrice: 6400,
        size: 'L',
        condition: '良品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Stylish%20quilted%20vest%20for%20dogs%20in%20beige%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20winter%20collection&width=400&height=500&seq=winter06&orientation=portrait'
      }
    ]
  },
  '2': {
    id: 2,
    title: 'サステナブル特集',
    subtitle: 'Sustainable Fashion',
    description: '環境に優しいリユース犬服で、地球とペットに優しい選択を',
    imageUrl: 'https://readdy.ai/api/search-image?query=Sustainable%20eco-friendly%20pet%20clothing%20concept%20photography%20with%20natural%20organic%20materials%20and%20green%20plants%20on%20clean%20white%20background%20featuring%20earth%20tone%20colors%20minimalist%20styling%20professional%20lifestyle%20photography%20for%20ethical%20pet%20fashion%20environmental%20consciousness%20theme&width=1400&height=600&seq=sustainable2024hero&orientation=landscape',
    content: {
      intro: [
        '私たちは、ファッションを楽しみながら地球環境にも配慮できる、サステナブルな選択肢を提供しています。',
        'リユース犬服を選ぶことで、新たな資源の消費を抑え、廃棄物を減らすことができます。',
        'また、売上の一部は動物保護団体に寄付され、保護犬たちの支援にも繋がります。'
      ],
      highlights: [
        '環境負荷を減らすリユース品',
        '品質の高い商品のみを厳選',
        '売上の一部を動物保護団体に寄付',
        '循環型社会への貢献',
        'CO2排出量の削減に貢献',
        '持続可能なペットファッション'
      ]
    },
    products: [
      {
        id: 201,
        name: 'オーガニックコットンTシャツ',
        brand: 'RADICA',
        price: 2400,
        originalPrice: 4800,
        size: 'M',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Natural%20organic%20cotton%20t-shirt%20for%20dogs%20in%20earth%20tone%20beige%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20sustainable%20pet%20fashion%20collection&width=400&height=500&seq=sustainable01&orientation=portrait'
      },
      {
        id: 202,
        name: 'リネンブレンドシャツ',
        brand: 'Free Stitch',
        price: 3200,
        originalPrice: 6200,
        size: 'L',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Breathable%20linen%20blend%20shirt%20for%20dogs%20in%20natural%20cream%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20sustainable%20pet%20fashion%20collection&width=400&height=500&seq=sustainable02&orientation=portrait'
      },
      {
        id: 203,
        name: 'リサイクル素材パーカー',
        brand: 'iDog',
        price: 2800,
        originalPrice: 5600,
        size: 'S',
        condition: '良品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Eco-friendly%20recycled%20material%20hoodie%20for%20dogs%20in%20soft%20gray%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20sustainable%20pet%20fashion%20collection&width=400&height=500&seq=sustainable03&orientation=portrait'
      },
      {
        id: 204,
        name: 'バンブーファイバータンクトップ',
        brand: 'PUPPIA',
        price: 2200,
        originalPrice: 4400,
        size: 'M',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Sustainable%20bamboo%20fiber%20tank%20top%20for%20dogs%20in%20natural%20brown%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20eco-friendly%20pet%20fashion%20collection&width=400&height=500&seq=sustainable04&orientation=portrait'
      },
      {
        id: 205,
        name: 'ヘンプ混紡ベスト',
        brand: 'Mandarine Brothers',
        price: 3400,
        originalPrice: 6800,
        size: 'L',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Natural%20hemp%20blend%20vest%20for%20dogs%20in%20earthy%20beige%20tone%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20sustainable%20pet%20fashion%20collection&width=400&height=500&seq=sustainable05&orientation=portrait'
      },
      {
        id: 206,
        name: 'オーガニックコットンワンピース',
        brand: 'RADICA',
        price: 3800,
        originalPrice: 7400,
        size: 'M',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Elegant%20organic%20cotton%20dress%20for%20dogs%20in%20soft%20cream%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20sustainable%20pet%20fashion%20collection&width=400&height=500&seq=sustainable06&orientation=portrait'
      }
    ]
  },
  '3': {
    id: 3,
    title: '人気ブランド特集',
    subtitle: 'Popular Brands',
    description: '有名ブランドの犬服を、お手頃価格でお届けします',
    imageUrl: 'https://readdy.ai/api/search-image?query=Premium%20luxury%20dog%20clothing%20brand%20collection%20photography%20featuring%20designer%20pet%20fashion%20items%20on%20clean%20white%20background%20with%20elegant%20styling%20neutral%20sophisticated%20color%20palette%20minimalist%20professional%20ecommerce%20photography%20for%20high-end%20pet%20boutique%20brand%20showcase&width=1400&height=600&seq=brands2024hero&orientation=landscape',
    content: {
      intro: [
        '人気の高い有名ブランドの犬服を、リユース価格でお手頃にご提供しています。',
        'RADICA、iDog、PUPPIA、Mandarine Brothers、Free Stitchなど、品質とデザインに定評のあるブランドを取り揃えています。',
        '新品では手が届きにくい高級ブランドも、リユースなら気軽にお試しいただけます。'
      ],
      highlights: [
        '人気ブランドが最大60%オフ',
        '品質保証付きのリユース品',
        'デザイン性と機能性を両立',
        '豊富なサイズとカラー展開',
        '状態の良い商品のみを厳選',
        'ブランド正規品のみ取扱い'
      ]
    },
    products: [
      {
        id: 301,
        name: 'デニムジャケット',
        brand: 'RADICA',
        price: 4200,
        originalPrice: 8900,
        size: 'M',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Stylish%20denim%20jacket%20for%20dogs%20in%20classic%20blue%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20brand%20collection&width=400&height=500&seq=brand01&orientation=portrait'
      },
      {
        id: 302,
        name: 'ボーダーカットソー',
        brand: 'iDog',
        price: 2600,
        originalPrice: 5200,
        size: 'S',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Classic%20striped%20shirt%20for%20dogs%20in%20navy%20and%20white%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20brand%20collection&width=400&height=500&seq=brand02&orientation=portrait'
      },
      {
        id: 303,
        name: 'レザージャケット',
        brand: 'PUPPIA',
        price: 5400,
        originalPrice: 12800,
        size: 'L',
        condition: '良品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Cool%20faux%20leather%20jacket%20for%20dogs%20in%20brown%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20brand%20collection&width=400&height=500&seq=brand03&orientation=portrait'
      },
      {
        id: 304,
        name: 'チェックシャツ',
        brand: 'Mandarine Brothers',
        price: 3400,
        originalPrice: 6800,
        size: 'M',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Trendy%20plaid%20check%20shirt%20for%20dogs%20in%20brown%20and%20cream%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20brand%20collection&width=400&height=500&seq=brand04&orientation=portrait'
      },
      {
        id: 305,
        name: 'ニットカーディガン',
        brand: 'Free Stitch',
        price: 3800,
        originalPrice: 7600,
        size: 'L',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Cozy%20knit%20cardigan%20for%20dogs%20in%20warm%20beige%20color%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20brand%20collection&width=400&height=500&seq=brand05&orientation=portrait'
      },
      {
        id: 306,
        name: 'スウェットパーカー',
        brand: 'RADICA',
        price: 3200,
        originalPrice: 6400,
        size: 'M',
        condition: '美品',
        imageUrl: 'https://readdy.ai/api/search-image?query=Comfortable%20sweat%20hoodie%20for%20dogs%20in%20neutral%20gray%20on%20clean%20white%20background%20professional%20product%20photography%20minimalist%20styling%20for%20premium%20pet%20fashion%20brand%20collection&width=400&height=500&seq=brand06&orientation=portrait'
      }
    ]
  }
};

export default function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const feature = id ? FEATURE_DATA[id] : null;

  if (!feature) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">特集が見つかりません</h1>
            <Link to="/features" className="text-orange-600 hover:underline cursor-pointer">
              特集一覧に戻る
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
      
      <div className="w-full h-96 bg-gray-100 overflow-hidden">
        <img 
          src={feature.imageUrl}
          alt={feature.title}
          className="w-full h-full object-cover object-top"
        />
      </div>

      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/features" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            <span>特集一覧に戻る</span>
          </Link>

          <div className="mb-16">
            <p className="text-gray-500 mb-2">{feature.subtitle}</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {feature.title}
            </h1>
            <p className="text-xl text-gray-600">{feature.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-6">特集について</h2>
              {feature.content.intro.map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">特徴</h2>
              <ul className="space-y-3">
                {feature.content.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <i className="ri-check-line text-orange-600 text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center"></i>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">おすすめ商品</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6" data-product-shop>
              {feature.products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group cursor-pointer"
                >
                  <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                  <h3 className="text-sm font-bold mb-2 group-hover:underline">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-orange-600">¥{(product.price ?? 0).toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">¥{product.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{product.size}</span>
                    <span>•</span>
                    <span>{product.condition}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              すべての商品を見る
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
