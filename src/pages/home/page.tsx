import { Link } from 'react-router-dom';
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
import { DONATION_RATE_LABEL } from '../../lib/donation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PageMeta path="/" />
      <Navigation />
      <main className="shop-home">
      {/* 寄付の案内はページ上部にも置く（下まで読まないと分からない構成にしない） */}
      <p className="shop-notice">お買い物の{DONATION_RATE_LABEL}が、保護犬・保護猫の支援に届きます<Link to="/impact">仕組みを見る</Link></p>
      <HeroSection />
      <NewArrivalsSection />
      <OwnersSection />
      <ExploreSection />
      <DonationSection />
      <FeaturedSection />
      <NewsSection />
      <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
