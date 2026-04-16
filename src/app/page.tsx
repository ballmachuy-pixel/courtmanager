import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingPhilosophy from '@/components/landing/LandingPhilosophy';
import LandingClasses from '@/components/landing/LandingClasses';
import LandingContact from '@/components/landing/LandingContact';
import LandingFooter from '@/components/landing/LandingFooter';
import FloatingContact from '@/components/landing/FloatingContact';

export default function SundaySunsetProfile() {
  return (
    <div className="profile-page min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      <LandingNav />
      
      <main>
        <LandingHero />
        <LandingPhilosophy />
        <LandingClasses />
        <LandingContact />
      </main>

      <LandingFooter />
      <FloatingContact />
    </div>
  );
}

