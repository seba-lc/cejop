"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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
import LoadingScreen from "@/components/LoadingScreen";
import FloatingCTA from "@/components/FloatingCTA";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to ensure branding is seen, 
    // but in a real app, logic would wait for video/fonts
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const handleVideoReady = () => {
      // Small buffer after video is ready
      setTimeout(() => setLoading(false), 500);
    };

    window.addEventListener("video-ready", handleVideoReady);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("video-ready", handleVideoReady);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen key="loading" />}
      </AnimatePresence>
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
      <FloatingCTA />
    </>
  );
}
