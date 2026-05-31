import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingSocialProof from '@/components/landing/LandingSocialProof';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingContact from '@/components/landing/LandingContact';
import LandingFooter from '@/components/landing/LandingFooter';
import FloatingContact from '@/components/landing/FloatingContact';

export default function CourtManagerSaaS() {
  return (
    <div className="profile-page min-h-screen bg-[#0a0a0a] text-white selection:bg-pink-500/30">
      <LandingNav />
      
      <main>
        <LandingHero />
        <LandingSocialProof />
        <LandingFeatures />
        <LandingContact />
      </main>

      <LandingFooter />
      <FloatingContact />
    </div>
  );
}
