import { useEffect, useState } from "react";
import { useMotionValue, useTransform, useSpring } from "framer-motion";

export const useSmoothScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  const scrollYMotion = useMotionValue(scrollY);
  const scrollYRange = useTransform(scrollYMotion, [0, 1], [0, 1]);
  const smoothScrollY = useSpring(scrollYRange, { stiffness: 50, damping: 25 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { scrollY: smoothScrollY };
};
