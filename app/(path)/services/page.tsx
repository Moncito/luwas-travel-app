import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicesHero from '@/components/(services)/ServicesHero';
import ServiceMain from '@/components/(services)/ServiceMain'; // <- NEW


export default function ServicesPage() {
  return (
    <div>
      <Navbar />
      <ServicesHero />
      <ServiceMain /> {/* <- COMBINED ServiceExperience + ServiceList */}
      <Footer />
    </div>
  );
}
