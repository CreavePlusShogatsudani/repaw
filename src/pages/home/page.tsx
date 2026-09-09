import PageMeta from '../../components/PageMeta';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import NewArrivalsSection from './components/NewArrivalsSection';
import OwnersSection from './components/OwnersSection';
import ExploreSection from './components/ExploreSection';
import DonationSection from './components/DonationSection';
import FeaturedSection from './components/FeaturedSection';
import NewsSection from './components/NewsSection';
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
      <ExploreSection />
      <OwnersSection />
      <FeaturedSection />
      <DonationSection />
      <NewsSection />
      <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
