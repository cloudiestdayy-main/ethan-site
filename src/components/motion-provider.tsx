"use client";

import { MotionConfig } from "framer-motion";
import type { PropsWithChildren } from "react";

/**
 * Le animazioni CSS rispettano già prefers-reduced-motion in globals.css;
 * questo estende la stessa preferenza ai componenti framer-motion (Reveal).
 */
export function MotionProvider({ children }: PropsWithChildren) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
