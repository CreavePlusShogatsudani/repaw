const IMPACT_STATS = [
  {
    icon: 'ri-recycle-line',
    value: '15,000+',
    label: '買取実績',
    description: '累計買取点数'
  },
  {
    icon: 'ri-leaf-line',
    value: '8,500kg',
    label: 'CO2削減',
    description: '環境負荷軽減'
  },
  {
    icon: 'ri-heart-line',
    value: '¥2.5M',
    label: '寄付総額',
    description: '動物保護支援'
  },
  {
    icon: 'ri-team-line',
    value: '12,000+',
    label: 'ユーザー数',
    description: '参加メンバー'
  }
];

export default function QuickImpactSection() {
  return (
    <section id="impact" className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Impact</h2>
          <p className="text-gray-600 text-sm tracking-wider">社会的価値</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {IMPACT_STATS.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full mx-auto mb-4">
                <i className={`${stat.icon} text-3xl`}></i>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">持続可能な未来のために</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              犬服のリユースは、ファッション産業の環境負荷を軽減し、
              動物保護活動を支援する、サステナブルな取り組みです。
              一人ひとりの小さな選択が、大きな変化を生み出します。
            </p>
            <a href="/impact" className="inline-block px-8 py-3 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap cursor-pointer">
              詳細を見る
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
