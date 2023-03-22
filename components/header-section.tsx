import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const cards = [
  {
    name: "On-Chain Reputation 🔥",
    description:
      "With Commend, you can build a reputation on-chain. This means that your reputation is immutable and can be used to prove your identity and trustworthiness.",
  },
  {
    name: "Give and Receive Commends",
    description:
      "It has never been easier to build your on-chain reputation. You can give commends to anyone with a profile on Commend. You can receive commends from anyone with a valid Ethereum address/wallet.",
  },
  {
    name: "Community Driven",
    description:
      "Commend is a community driven platform. I'm building building the platform with the community, for the community. If you have any ideas or suggestions, please let me know!",
  },
];

export default function HeaderSection() {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.5 } },
  };

  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const { scrollY } = useSmoothScroll();
  return (
    <motion.div
      className="relative isolate overflow-hidden bg-white py-24 sm:py-32 z-40"
      style={{ y: scrollY }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {cards.map((card, index) => (
            <div
              key={card.name}
              className="flex gap-x-4 rounded-xl bg-white/5 p-6 ring-1 ring-inset ring-white/10"
              ref={ref}
            >
              <AnimatePresence>
                {inView && (
                  <motion.div
                    className="text-base leading-7"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <h3 className="font-semibold text-black">{card.name}</h3>
                    <p className="mt-2 text-black">{card.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
