"use client";

import { motion, type MotionProps } from "framer-motion";
import type { PropsWithChildren } from "react";

type RevealProps = PropsWithChildren<
  {
    className?: string;
    delay?: number;
  } & MotionProps
>;

export function Reveal({ children, className, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
