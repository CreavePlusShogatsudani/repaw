import { Link } from 'react-router-dom';

const FEATURES = [
  {
    id: 1,
    title: '冬の新着コレクション',
    subtitle: 'Winter New Arrivals',
    description: '寒い季節にぴったりな、暖かくておしゃれな犬服が揃いました',
    imageUrl: 'https://readdy.ai/api/search-image?query=Elegant%20winter%20dog%20clothing%20collection%20photography%20featuring%20cozy%20knit%20sweaters%20warm%20coats%20and%20stylish%20jackets%20on%20clean%20white%20background%20with%20soft%20natural%20lighting%20neutral%20beige%20cream%20and%20brown%20color%20palette%20minimalist%20professional%20ecommerce%20style%20for%20premium%20pet%20fashion%20seasonal%20collection&width=600&height=700&seq=wintercollection2024&orientation=portrait'
  },
  {
    id: 2,
    title: 'サステナブル特集',
    subtitle: 'Sustainable Fashion',
    description: '環境に優しいリユース犬服で、地球とペットに優しい選択を',
    imageUrl: 'https://readdy.ai/api/search-image?query=Sustainable%20eco-friendly%20pet%20clothing%20concept%20photography%20with%20natural%20organic%20materials%20and%20green%20plants%20on%20clean%20white%20background%20featuring%20earth%20tone%20colors%20minimalist%20styling%20professional%20lifestyle%20photography%20for%20ethical%20pet%20fashion%20environmental%20consciousness%20theme&width=600&height=700&seq=sustainable2024&orientation=portrait'
  },
  {
    id: 3,
    title: '人気ブランド特集',
    subtitle: 'Popular Brands',
    description: '有名ブランドの犬服を、お手頃価格でお届けします',
    imageUrl: 'https://readdy.ai/api/search-image?query=Premium%20luxury%20dog%20clothing%20brand%20collection%20photography%20featuring%20designer%20pet%20fashion%20items%20on%20clean%20white%20background%20with%20elegant%20styling%20neutral%20sophisticated%20color%20palette%20minimalist%20professional%20ecommerce%20photography%20for%20high-end%20pet%20boutique%20brand%20showcase&width=600&height=700&seq=brands2024&orientation=portrait'
  }
];

export default function FeaturedSection() {
  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Featured</h2>
          <p className="text-gray-600 text-sm tracking-wider">特集</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <Link
              key={feature.id}
              to={`/features/${feature.id}`}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-full h-96 bg-gray-100 overflow-hidden">
                <img 
                  src={feature.imageUrl}
                  alt={feature.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <p className="text-xs text-gray-500 mb-2 tracking-wider">{feature.subtitle}</p>
                <h3 className="text-xl font-bold mb-3 group-hover:underline">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/features"
            className="inline-block px-8 py-3 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            すべての特集を見る
          </Link>
        </div>
      </div>
    </section>
  );
}
