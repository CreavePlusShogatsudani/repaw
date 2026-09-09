import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/PageHeader';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import ContactSection from '../home/components/ContactSection';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta title="お問い合わせ" description="RePawへのお問い合わせフォーム。商品・配送・買取についてのご質問を受け付けています。" path="/contact" />
      <Navigation />

      <main className="page">
        <div className="shop-container pb-24">
          <PageHeader eyebrow="Contact" title="お問い合わせ" lead="商品・配送・買取について、ログイン後にフォームからご質問いただけます。回答はマイページの「問い合わせ履歴」でご確認ください。" />
          <div className="max-w-[44em]">
            <ContactSection standalone />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
