import React from "react";
import ParallaxText from "./scroll-velocity";

export default function ParallaxTextSection() {
  return (
    <section className="mt-12 mb-12 text-center max-w-7xl">
      <ParallaxText baseVelocity={5}>Commend.</ParallaxText>
    </section>
  );
}
