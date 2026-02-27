"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import type { ReactNode } from "react"

interface RevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  delay?: number
}

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for "luxury" ease
        type: "tween"
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
