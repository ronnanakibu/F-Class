import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import Students from '@/components/Students';
import AppleSlideshow from '@/components/AppleSlideshow';
import Gallery from '@/components/Gallery';
import Projects from '@/components/Projects';
import Frequency from '@/components/Frequency';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Manifesto />
        <section className="border-t border-border" aria-hidden="true" />
        <Students />
        <section className="border-t border-border" aria-hidden="true" />
        <AppleSlideshow />
        <section className="border-t border-border" aria-hidden="true" />
        <Gallery />
        <section className="border-t border-border" aria-hidden="true" />
        <Projects />
        <section className="border-t border-border" aria-hidden="true" />
        <Frequency />
      </main>
      <Footer />
    </>
  );
}
