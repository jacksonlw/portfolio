import { motion, useAnimation } from "framer-motion";
import React, { ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function useOnScreen(ref: any, rootMargin = "0px") {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.unobserve(ref.current);
    };
  }, [rootMargin, ref]);

  return isIntersecting;
}

function ShowOnScroll({ children, className, delay = 0.2 }: Props) {
  const controls = useAnimation();
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  useEffect(() => {
    if (onScreen) {
      controls.start({
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          delay: delay,
          ease: "easeOut",
        },
      });
    }
  }, [onScreen, controls, delay]);

  return (
    <motion.div
      className={className}
      ref={ref}
      initial={{ opacity: 0, y: -30 }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}

export default ShowOnScroll;
