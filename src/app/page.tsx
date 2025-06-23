import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import SectionDivider from '@/components/SectionDivider';

const BackgroundArt = dynamic(() => import('@/components/BackgroundArt'), { ssr: false });

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Header />
      <main className="flex-1 relative overflow-x-clip">
        <BackgroundArt />
        <Hero />
        <About />
        <Projects
            className="py-12 md:py-24 lg:py-32" 
            limit={3} 
            showViewAllButton={true} 
            title="Latest Creations"
            description="Here are a few of my most recent projects. Feel free to explore more of my work on the projects page."
        />
        <SectionDivider />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
