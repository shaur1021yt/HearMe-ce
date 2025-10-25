"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Wand2, Trash2, FileText } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ControlsProps {
  isRecording: boolean
  isFillBlanksEnabled: boolean
  isProcessing: boolean
  isSummarizing?: boolean
  browserSupported: boolean
  language: string
  translateTo: string
  onStartRecording: () => void
  onStopRecording: () => void
  onToggleFillBlanks: () => void
  onFillBlanks: () => void
  onClear: () => void
  onLanguageChange: (language: string) => void
  onTranslateToChange: (language: string) => void
  onSummarize?: () => void
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

export function Controls({
  isRecording,
  isFillBlanksEnabled,
  isProcessing,
  isSummarizing,
  browserSupported,
  language,
  translateTo,
  onStartRecording,
  onStopRecording,
  onToggleFillBlanks,
  onFillBlanks,
  onClear,
  onLanguageChange,
  onTranslateToChange,
  onSummarize,
}: ControlsProps) {
  return (
    <motion.div
      className="glass p-6 rounded-2xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 25 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="language-select" className="text-sm text-foreground whitespace-nowrap">
            Listen in:
          </Label>
          <Select value={language} onValueChange={onLanguageChange} disabled={isRecording || isProcessing}>
            <SelectTrigger id="language-select" className="glass border-border bg-transparent text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-border">
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-ES">Spanish</SelectItem>
              <SelectItem value="fr-FR">French</SelectItem>
              <SelectItem value="de-DE">German</SelectItem>
              <SelectItem value="it-IT">Italian</SelectItem>
              <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
              <SelectItem value="ja-JP">Japanese</SelectItem>
              <SelectItem value="ko-KR">Korean</SelectItem>
              <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
              <SelectItem value="ar-SA">Arabic</SelectItem>
              <SelectItem value="hi-IN">Hindi</SelectItem>
              <SelectItem value="ru-RU">Russian</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label htmlFor="translate-select" className="text-sm text-foreground whitespace-nowrap">
            Translate to:
          </Label>
          <Select value={translateTo} onValueChange={onTranslateToChange} disabled={isRecording || isProcessing}>
            <SelectTrigger id="translate-select" className="glass border-border bg-transparent text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-border">
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-ES">Spanish</SelectItem>
              <SelectItem value="fr-FR">French</SelectItem>
              <SelectItem value="de-DE">German</SelectItem>
              <SelectItem value="it-IT">Italian</SelectItem>
              <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
              <SelectItem value="ja-JP">Japanese</SelectItem>
              <SelectItem value="ko-KR">Korean</SelectItem>
              <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
              <SelectItem value="ar-SA">Arabic</SelectItem>
              <SelectItem value="hi-IN">Hindi</SelectItem>
              <SelectItem value="ru-RU">Russian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={!browserSupported || isProcessing}
              className={`relative overflow-hidden transition-all duration-300 ${
                isRecording
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              <motion.div
                className="flex items-center"
                initial={false}
                animate={{ scale: isRecording ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 1, repeat: isRecording ? Number.POSITIVE_INFINITY : 0 }}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </motion.div>
            </Button>
          </motion.div>

          {isRecording && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div
                className="w-3 h-3 bg-destructive rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <span className="text-sm text-muted-foreground">Recording</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Switch
              id="fill-blanks-mode"
              checked={isFillBlanksEnabled}
              onCheckedChange={onToggleFillBlanks}
              disabled={isProcessing}
            />
            <Label htmlFor="fill-blanks-mode" className="text-sm text-foreground cursor-pointer">
              Fill Blanks
            </Label>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={onFillBlanks}
              disabled={isProcessing || !isFillBlanksEnabled}
              className="glass border-primary/50 hover:bg-primary/10 text-foreground bg-transparent"
            >
              <motion.div
                animate={isProcessing ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: isProcessing ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
              >
                <Wand2 className="w-4 h-4 mr-2" />
              </motion.div>
              Fill
            </Button>
          </motion.div>

          {onSummarize && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={onSummarize}
                disabled={isProcessing || isSummarizing}
                className="glass border-primary/50 hover:bg-primary/10 text-foreground bg-transparent"
              >
                <FileText className="w-4 h-4 mr-2" />
                Summarize
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={onClear}
              disabled={isProcessing}
              className="glass border-border hover:bg-destructive/10 text-foreground bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
