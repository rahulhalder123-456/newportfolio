import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Projects
            className="py-12 md:py-24 lg:py-32" 
            limit={3} 
            showViewAllButton={true} 
            title="Latest Creations"
            description="Here are a few of my most recent projects. Feel free to explore more of my work on the projects page."
        />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
