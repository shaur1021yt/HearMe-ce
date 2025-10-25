"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { TranscriptBox } from "@/components/transcript-box"
import { Controls } from "@/components/controls"
import { ErrorBoundary } from "@/components/error-boundary"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface HearMeAppProps {
  initialTranscript?: string
  initialLanguage?: string
  onSave?: (content: string, language: string) => void
}

export function HearMeApp({ initialTranscript = "", initialLanguage = "en-US", onSave }: HearMeAppProps) {
  const [transcript, setTranscript] = useState(initialTranscript)
  const [originalTranscript, setOriginalTranscript] = useState(initialTranscript)
  const [translatedTranscript, setTranslatedTranscript] = useState(initialTranscript)
  const [isRecording, setIsRecording] = useState(false)
  const [isFillBlanksEnabled, setIsFillBlanksEnabled] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [browserSupported, setBrowserSupported] = useState(true)
  const [language, setLanguage] = useState(initialLanguage)
  const [translateTo, setTranslateTo] = useState(initialLanguage)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef("")
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const inaudibleSegmentsRef = useRef<Array<{ index: number; context: string }>>([])

  useEffect(() => {
    setTranscript(initialTranscript)
    setOriginalTranscript(initialTranscript)
    setTranslatedTranscript(initialTranscript)
    finalTranscriptRef.current = initialTranscript
  }, [initialTranscript])

  useEffect(() => {
    setLanguage(initialLanguage)
  }, [initialLanguage])

  useEffect(() => {
    if (onSave && transcript) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        onSave(transcript, language)
      }, 2000)
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [transcript, language, onSave])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setBrowserSupported(false)
        setError("Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.")
      }
    }
  }, [])

  const translateText = async (text: string, fromLang: string, toLang: string) => {
    if (fromLang === toLang || !text.trim()) {
      return text
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          fromLanguage: fromLang,
          toLanguage: toLang,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()
      return data.translated || text
    } catch (err) {
      console.error("Translation failed:", err)
      return text
    }
  }

  const processInaudibleSegments = async (text: string) => {
    if (!isFillBlanksEnabled || inaudibleSegmentsRef.current.length === 0) {
      return text
    }

    try {
      const response = await fetch("/api/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          language: language,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process inaudible segments")
      }

      const data = await response.json()
      inaudibleSegmentsRef.current = []
      return data.fixed || text
    } catch (err) {
      console.error("AI processing failed:", err)
      return text
    }
  }

  const startRecording = () => {
    if (!browserSupported) return

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language
      recognition.maxAlternatives = 3

      recognition.onstart = () => {
        setIsRecording(true)
        setError(null)
        finalTranscriptRef.current = transcript
        inaudibleSegmentsRef.current = []
      }

      recognition.onresult = async (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcriptPiece = result[0].transcript
          const confidence = result[0].confidence

          if (result.isFinal) {
            if (confidence < 0.5 && isFillBlanksEnabled) {
              const inaudibleMarker = `[INAUDIBLE: ${transcriptPiece}]`
              finalTranscript += inaudibleMarker + " "
              inaudibleSegmentsRef.current.push({
                index: finalTranscriptRef.current.length + finalTranscript.length,
                context: finalTranscriptRef.current + finalTranscript,
              })
            } else {
              finalTranscript += transcriptPiece + " "
            }
          } else {
            interimTranscript += transcriptPiece
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript

          if (isFillBlanksEnabled && inaudibleSegmentsRef.current.length > 0) {
            const processed = await processInaudibleSegments(finalTranscriptRef.current)
            finalTranscriptRef.current = processed
          }

          setOriginalTranscript(finalTranscriptRef.current)

          if (language !== translateTo) {
            const translated = await translateText(finalTranscriptRef.current, language, translateTo)
            setTranslatedTranscript(translated)
          } else {
            setTranslatedTranscript(finalTranscriptRef.current)
          }
        }

        setTranscript(finalTranscriptRef.current + interimTranscript)
        setOriginalTranscript(finalTranscriptRef.current + interimTranscript)
      }

      recognition.onerror = (event: any) => {
        setError(`Recognition error: ${event.error}`)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.start()
      recognitionRef.current = recognition
    } catch (err) {
      setError("Failed to start recording. Please check your microphone permissions.")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  const fillBlanks = async () => {
    if (!transcript.trim()) {
      setError("No transcript to process")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: transcript,
          language: language,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process transcript")
      }

      const data = await response.json()
      setTranscript(data.fixed || data.text)
      finalTranscriptRef.current = data.fixed || data.text
      setOriginalTranscript(data.fixed || data.text)
      if (language !== translateTo) {
        const translated = await translateText(data.fixed || data.text, language, translateTo)
        setTranslatedTranscript(translated)
      } else {
        setTranslatedTranscript(data.fixed || data.text)
      }
    } catch (err) {
      setError("Fill blanks unavailable. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const summarizeTranscript = async () => {
    if (!transcript.trim()) {
      setError("No transcript to summarize")
      return
    }

    setIsSummarizing(true)
    setError(null)

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: transcript,
          language: language,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to summarize transcript")
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      setError("Summarization unavailable. Please try again.")
    } finally {
      setIsSummarizing(false)
    }
  }

  const clearTranscript = () => {
    setTranscript("")
    setOriginalTranscript("")
    setTranslatedTranscript("")
    finalTranscriptRef.current = ""
    inaudibleSegmentsRef.current = []
    setSummary(null)
    setError(null)
  }

  const showSplitView = language !== translateTo

  return (
    <ErrorBoundary>
      <div className="min-h-screen gradient-bg relative overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full blur-3xl float-orb"
          style={{
            background: "radial-gradient(circle, oklch(0.7 0.28 280 / 0.3) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[600px] h-[600px] rounded-full blur-3xl float-orb-reverse"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.25 200 / 0.3) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.22 320 / 0.2) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
        />

        <motion.div
          className="relative z-10 container mx-auto px-4 py-8 max-w-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Header />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Alert variant="destructive" className="mb-6 glass">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <TranscriptBox
            transcript={showSplitView ? originalTranscript : transcript}
            translatedTranscript={showSplitView ? translatedTranscript : undefined}
            isRecording={isRecording}
            isProcessing={isProcessing}
            isSummarizing={isSummarizing}
            summary={summary}
            showSplitView={showSplitView}
            originalLanguage={language}
            translatedLanguage={translateTo}
          />

          <Controls
            isRecording={isRecording}
            isFillBlanksEnabled={isFillBlanksEnabled}
            isProcessing={isProcessing}
            isSummarizing={isSummarizing}
            browserSupported={browserSupported}
            language={language}
            translateTo={translateTo}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onToggleFillBlanks={() => setIsFillBlanksEnabled(!isFillBlanksEnabled)}
            onFillBlanks={fillBlanks}
            onClear={clearTranscript}
            onLanguageChange={setLanguage}
            onTranslateToChange={setTranslateTo}
            onSummarize={summarizeTranscript}
          />
        </motion.div>
      </div>
    </ErrorBoundary>
  )
}
