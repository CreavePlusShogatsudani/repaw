import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ServiceSection from './components/ServiceSection';
import NewArrivalsSection from './components/NewArrivalsSection';
import ProductsSection from './components/ProductsSection';
import FeaturedSection from './components/FeaturedSection';
import NewsSection from './components/NewsSection';
import QuickSystemSection from './components/QuickSystemSection';
import QuickImpactSection from './components/QuickImpactSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <ServiceSection />
      <NewArrivalsSection />
      <ProductsSection />
      <FeaturedSection />
      <NewsSection />
      <QuickSystemSection />
      <QuickImpactSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
