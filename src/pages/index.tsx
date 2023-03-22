import React from "react";

import { motion } from "framer-motion";

import Navbar from "@/components/navbar";
import AsciiFireAnimation from "@/components/ascii-fire";
import HeaderSection from "@/components/header-section";
import ParallaxText from "@/components/scroll-velocity";
import ParallaxTextSection from "@/components/parallax-text";
import PreviewProject from "@/components/preview-project";

import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export default function LandingPage() {
  const { scrollY } = useSmoothScroll();
  return (
    <motion.div style={{ y: scrollY }}>
      <div className="relative bg-black h-screen">
        <div className="fixed inset-x-0 bottom-0 z-10">
          <AsciiFireAnimation />
        </div>
        <div className="relative h-screen bg-black">
          <div className="h-screen" />
          <div className="sticky z-20">
            <HeaderSection />
          </div>
          <div className=" z-20 bg-black">
            <div className="flex flex-col items-center justify-center text-white">
              <ParallaxTextSection />
            </div>
          </div>
          <div className="sticky z-20">
            <PreviewProject />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
