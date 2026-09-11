import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import Students from '@/components/Students';
import Timeline from '@/components/Timeline';
import Gallery from '@/components/Gallery';
import Projects from '@/components/Projects';
import Culture from '@/components/Culture';
import Footer from '@/components/Footer';

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
        <Timeline />
        <section className="border-t border-border" aria-hidden="true" />
        <Gallery />
        <section className="border-t border-border" aria-hidden="true" />
        <Projects />
        <section className="border-t border-border" aria-hidden="true" />
        <Culture />
      </main>
      <Footer />
    </>
  );
}
