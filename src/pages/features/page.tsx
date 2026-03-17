import { Link } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';

const FEATURES = [
  {
    id: 1,
    title: '冬の新着コレクション',
    subtitle: 'Winter New Arrivals',
    description: '寒い季節にぴったりな、暖かくておしゃれな犬服が揃いました',
    imageUrl: 'https://readdy.ai/api/search-image?query=Elegant%20winter%20dog%20clothing%20collection%20photography%20featuring%20cozy%20knit%20sweaters%20warm%20coats%20and%20stylish%20jackets%20on%20clean%20white%20background%20with%20soft%20natural%20lighting%20neutral%20beige%20cream%20and%20brown%20color%20palette%20minimalist%20professional%20ecommerce%20style%20for%20premium%20pet%20fashion%20seasonal%20collection&width=800&height=600&seq=wintercollection2024list&orientation=landscape',
    tag: '新着',
    itemCount: 24
  },
  {
    id: 2,
    title: 'サステナブル特集',
    subtitle: 'Sustainable Fashion',
    description: '環境に優しいリユース犬服で、地球とペットに優しい選択を',
    imageUrl: 'https://readdy.ai/api/search-image?query=Sustainable%20eco-friendly%20pet%20clothing%20concept%20photography%20with%20natural%20organic%20materials%20and%20green%20plants%20on%20clean%20white%20background%20featuring%20earth%20tone%20colors%20minimalist%20styling%20professional%20lifestyle%20photography%20for%20ethical%20pet%20fashion%20environmental%20consciousness%20theme&width=800&height=600&seq=sustainable2024list&orientation=landscape',
    tag: '人気',
    itemCount: 18
  },
  {
    id: 3,
    title: '人気ブランド特集',
    subtitle: 'Popular Brands',
    description: '有名ブランドの犬服を、お手頃価格でお届けします',
    imageUrl: 'https://readdy.ai/api/search-image?query=Premium%20luxury%20dog%20clothing%20brand%20collection%20photography%20featuring%20designer%20pet%20fashion%20items%20on%20clean%20white%20background%20with%20elegant%20styling%20neutral%20sophisticated%20color%20palette%20minimalist%20professional%20ecommerce%20photography%20for%20high-end%20pet%20boutique%20brand%20showcase&width=800&height=600&seq=brands2024list&orientation=landscape',
    tag: 'おすすめ',
    itemCount: 32
  },
  {
    id: 4,
    title: '春の新作コレクション',
    subtitle: 'Spring Collection',
    description: '春らしい明るいカラーとデザインの犬服が入荷しました',
    imageUrl: 'https://readdy.ai/api/search-image?query=Fresh%20spring%20dog%20clothing%20collection%20photography%20featuring%20light%20pastel%20colors%20floral%20patterns%20and%20breathable%20fabrics%20on%20clean%20white%20background%20with%20soft%20natural%20lighting%20cheerful%20bright%20aesthetic%20minimalist%20professional%20ecommerce%20style%20for%20seasonal%20pet%20fashion&width=800&height=600&seq=springcollection2024list&orientation=landscape',
    tag: '新着',
    itemCount: 20
  },
  {
    id: 5,
    title: '小型犬向け特集',
    subtitle: 'For Small Dogs',
    description: 'チワワ、トイプードルなど小型犬にぴったりなサイズ展開',
    imageUrl: 'https://readdy.ai/api/search-image?query=Adorable%20small%20dog%20clothing%20collection%20photography%20featuring%20tiny%20pet%20outfits%20for%20chihuahua%20and%20toy%20poodle%20on%20clean%20white%20background%20with%20cute%20styling%20neutral%20warm%20color%20palette%20minimalist%20professional%20ecommerce%20photography%20for%20petite%20pet%20fashion&width=800&height=600&seq=smalldogs2024list&orientation=landscape',
    tag: '人気',
    itemCount: 28
  },
  {
    id: 6,
    title: 'レインコート特集',
    subtitle: 'Rainwear Collection',
    description: '雨の日のお散歩も快適に。機能的でおしゃれなレインコート',
    imageUrl: 'https://readdy.ai/api/search-image?query=Functional%20waterproof%20dog%20raincoat%20collection%20photography%20featuring%20colorful%20rain%20jackets%20and%20protective%20outerwear%20on%20clean%20white%20background%20with%20water%20droplets%20neutral%20and%20bright%20color%20palette%20minimalist%20professional%20ecommerce%20style%20for%20practical%20pet%20fashion&width=800&height=600&seq=rainwear2024list&orientation=landscape',
    tag: 'おすすめ',
    itemCount: 15
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Features</h1>
            <p className="text-gray-600 text-lg">特集一覧</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <Link
                key={feature.id}
                to={`/features/${feature.id}`}
                className="group cursor-pointer"
              >
                <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={feature.imageUrl}
                    alt={feature.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full whitespace-nowrap">
                      {feature.tag}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">{feature.subtitle}</p>
                <h3 className="text-xl font-bold mb-2 group-hover:underline">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <p className="text-sm text-orange-600 font-medium">{feature.itemCount}点の商品</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
