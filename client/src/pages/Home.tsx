import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { HeroSection } from "@/components/site/hero-section";
import { TrackForm } from "@/components/site/track-form";
import { FeaturesSection } from "@/components/site/features-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/15 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[150px]" />
      </div>

      <Navbar />
      
      <main className="flex-grow flex flex-col justify-center items-center px-6 py-20">
        <HeroSection />
        <TrackForm />
        <FeaturesSection />
      </main>
      
      <Footer />
    </div>
  );
}
