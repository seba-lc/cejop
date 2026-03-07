import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import SocialProof from "@/components/SocialProof";
import FAQ from "@/components/FAQ";
import CTAForm from "@/components/CTAForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Benefits />
        <HowItWorks />
        <SocialProof />
        <FAQ />
        <CTAForm />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
