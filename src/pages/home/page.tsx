import PageMeta from '../../components/PageMeta';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import NewArrivalsSection from './components/NewArrivalsSection';
import SizeSection from './components/SizeSection';
import FeaturedSection from './components/FeaturedSection';
import NewsSection from './components/NewsSection';
import QuickSystemSection from './components/QuickSystemSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta path="/" />
      <Navigation />
      <main className="shop-home">
        <HeroSection />
        <NewArrivalsSection />
        <SizeSection />
        <FeaturedSection />
        <QuickSystemSection />
        <NewsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
