const SERVICES = [
  {
    icon: 'ri-recycle-line',
    title: '買取サービス',
    description: '使わなくなった犬服を買取。状態に応じて適正価格で評価します。',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    icon: 'ri-shopping-bag-line',
    title: 'リユース販売',
    description: '厳選された犬服を最大70%OFFで販売。品質チェック済みで安心。',
    color: 'bg-gray-100 text-gray-800'
  },
  {
    icon: 'ri-heart-line',
    title: '寄付プログラム',
    description: '売上の一部を動物保護団体へ寄付。購入で社会貢献できます。',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    icon: 'ri-instagram-line',
    title: '売主の可視化',
    description: '売主のインスタグラムと連携。誰から譲られた服かがわかる透明性とコミュニティ形成。',
    color: 'bg-gray-100 text-gray-800'
  }
];

export default function ServiceSection() {
  return (
    <section id="service" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Service</h2>
          <p className="text-gray-600 text-sm tracking-wider">サービス概要</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {SERVICES.map((service, index) => (
            <div key={index} className="text-center group">
              <div className={`w-16 h-16 flex items-center justify-center ${service.color} rounded-full mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                <i className={`${service.icon} text-3xl`}></i>
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
