"use client"

import { motion } from "framer-motion"
import { Mic } from "lucide-react"

export function Header() {
  return (
    <header className="text-center mb-12">
      <motion.div
        className="flex items-center justify-center gap-3 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <motion.div
          className="p-3 rounded-2xl glass"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Mic className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-5xl font-bold text-balance text-primary">HearMe</h1>
      </motion.div>
      <motion.p
        className="text-lg text-muted-foreground text-balance"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Real-time speech transcription with AI fill-in
      </motion.p>
    </header>
  )
}
