"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface TranscriptBoxProps {
  transcript: string
  translatedTranscript?: string
  isRecording: boolean
  isProcessing: boolean
  isSummarizing?: boolean
  summary?: string | null
  showSplitView?: boolean
  originalLanguage?: string
  translatedLanguage?: string
}

const getLanguageName = (code: string) => {
  const languages: Record<string, string> = {
    "en-US": "English",
    "es-ES": "Spanish",
    "fr-FR": "French",
    "de-DE": "German",
    "it-IT": "Italian",
    "pt-BR": "Portuguese",
    "ja-JP": "Japanese",
    "ko-KR": "Korean",
    "zh-CN": "Chinese",
    "ar-SA": "Arabic",
    "hi-IN": "Hindi",
    "ru-RU": "Russian",
  }
  return languages[code] || code
}

export function TranscriptBox({
  transcript,
  translatedTranscript,
  isRecording,
  isProcessing,
  isSummarizing,
  summary,
  showSplitView,
  originalLanguage,
  translatedLanguage,
}: TranscriptBoxProps) {
  const renderTranscript = (text: string) => {
    const parts = text.split(/(\[INAUDIBLE:.*?\])/g)

    return parts.map((part, index) => {
      if (part.match(/\[INAUDIBLE:.*?\]/)) {
        return (
          <motion.span
            key={index}
            className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded border border-yellow-500/30"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {part}
          </motion.span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const renderContent = () => {
    if (!transcript && !translatedTranscript) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <motion.div
            className="mb-4"
            animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 1.5, repeat: isRecording ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" }}
          >
            <div className="relative w-20 h-20 flex items-center justify-center">
              <motion.div
                className={`absolute inset-0 rounded-full ${isRecording ? "bg-primary/20" : "bg-muted/50"}`}
                animate={
                  isRecording
                    ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.2, 0.5],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: isRecording ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" }}
              />
              <motion.div
                className={`absolute w-12 h-12 rounded-full ${isRecording ? "bg-primary/40" : "bg-muted/70"}`}
                animate={
                  isRecording
                    ? {
                        scale: [1, 1.15, 1],
                        opacity: [0.6, 0.3, 0.6],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
              <motion.div
                className={`w-6 h-6 rounded-full ${isRecording ? "bg-primary" : "bg-muted-foreground/50"}`}
                animate={
                  isRecording
                    ? {
                        scale: [1, 1.1, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </div>
          </motion.div>
          <motion.p
            className="text-muted-foreground text-lg"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            {isRecording ? "Listening..." : "Click the microphone to start recording"}
          </motion.p>
        </div>
      )
    }

    if (showSplitView && translatedTranscript) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              {getLanguageName(originalLanguage || "")}
            </div>
            <div className="prose prose-invert max-w-none flex-1 overflow-auto">
              <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                {renderTranscript(transcript)}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col border-l border-border/30 pl-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              {getLanguageName(translatedLanguage || "")}
            </div>
            <div className="prose prose-invert max-w-none flex-1 overflow-auto">
              <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                {renderTranscript(translatedTranscript)}
              </p>
            </div>
          </motion.div>
        </div>
      )
    }

    return (
      <motion.div
        className="prose prose-invert max-w-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">{renderTranscript(transcript)}</p>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
        whileHover={{ scale: 1.01 }}
      >
        <Card className="glass p-8 mb-8 min-h-[300px] relative overflow-hidden">
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                className="absolute inset-0 glass flex items-center justify-center z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-lg text-foreground">Filling in the blanks...</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {renderContent()}
        </Card>
      </motion.div>

      <AnimatePresence>
        {(summary || isSummarizing) && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <Card className="glass p-6 mb-8 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold text-foreground">Summary</h3>
              </div>

              {isSummarizing ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Generating summary...</span>
                </div>
              ) : (
                <motion.p
                  className="text-base leading-relaxed text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {summary}
                </motion.p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
