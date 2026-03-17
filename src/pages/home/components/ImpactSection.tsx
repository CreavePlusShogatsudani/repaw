export default function ImpactSection() {
  return (
    <section id="impact" className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Impact</h2>
          <p className="text-gray-600 text-sm tracking-wider">社会的価値・インパクト</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold mb-6">持続可能な未来のために</h3>
            <p className="text-gray-700 leading-relaxed mb-8">
              ReWearは、犬服のリユースを通じて、環境保護と動物保護の両立を目指しています。ペット用品の廃棄削減、循環型社会の実現、動物保護団体への継続的支援、そして飼い主の経済的負担軽減という4つの価値を提供します。
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">12,450</div>
                <p className="text-sm text-gray-600">リユース商品数</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">¥2.8M</div>
                <p className="text-sm text-gray-600">累計寄付金額</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">8,320</div>
                <p className="text-sm text-gray-600">CO2削減量(kg)</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">156</div>
                <p className="text-sm text-gray-600">支援した保護犬数</p>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://readdy.ai/api/search-image?query=A%20heartwarming%20photograph%20of%20happy%20rescued%20dogs%20of%20various%20breeds%20playing%20together%20in%20a%20bright%20modern%20animal%20shelter%20with%20natural%20sunlight%2C%20clean%20white%20walls%2C%20caring%20volunteers%20in%20the%20background%2C%20hopeful%20and%20positive%20atmosphere%2C%20professional%20documentary%20photography%20style%2C%20warm%20natural%20lighting&width=800&height=600&seq=impact001&orientation=landscape"
              alt="動物保護活動"
              className="w-full h-[500px] object-cover object-top rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="bg-white p-12 rounded-2xl">
          <h3 className="text-2xl font-bold text-center mb-12">私たちが目指す4つの価値</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-green-100 rounded-full">
                <i className="ri-recycle-line text-4xl text-green-600"></i>
              </div>
              <h4 className="font-bold mb-3">環境保護</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                ペット用品の廃棄を削減し、地球環境の保全に貢献します
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-blue-100 rounded-full">
                <i className="ri-refresh-line text-4xl text-blue-600"></i>
              </div>
              <h4 className="font-bold mb-3">循環型社会</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                リユース市場を活性化し、持続可能な社会を実現します
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-purple-100 rounded-full">
                <i className="ri-heart-pulse-line text-4xl text-purple-600"></i>
              </div>
              <h4 className="font-bold mb-3">動物保護支援</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                動物保護団体への継続的な支援を実現します
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-orange-100 rounded-full">
                <i className="ri-wallet-line text-4xl text-orange-600"></i>
              </div>
              <h4 className="font-bold mb-3">経済的負担軽減</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                飼い主の経済的負担を軽減し、より多くの愛を届けます
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
