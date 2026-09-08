import PageMeta from '../../components/PageMeta';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import ContactSection from '../home/components/ContactSection';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="お問い合わせ" description="RePawへのお問い合わせフォーム。商品・配送・買取についてのご質問を受け付けています。" path="/contact" />
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Contact</h1>
            <p className="text-gray-600 text-sm tracking-wider">お問い合わせ</p>
          </div>
          <ContactSection standalone />
        </div>
      </main>

      <Footer />
    </div>
  );
}
