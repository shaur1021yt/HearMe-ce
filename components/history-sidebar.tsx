"use client"

import { motion } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, LogOut, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Transcript {
  id: string
  content: string
  language: string
  created_at: string
  updated_at: string
}

interface HistorySidebarProps {
  transcripts: Transcript[]
  currentTranscriptId: string | null
  isLoading: boolean
  user: User
  onLoadTranscript: (transcript: Transcript) => void
  onNewTranscript: () => void
  onDeleteTranscript: (id: string) => void
  onSignOut: () => void
  onClose: () => void
}

export function HistorySidebar({
  transcripts,
  currentTranscriptId,
  isLoading,
  user,
  onLoadTranscript,
  onNewTranscript,
  onDeleteTranscript,
  onSignOut,
  onClose,
}: HistorySidebarProps) {
  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen w-80 glass border-r border-white/20 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">HearMe</h2>
          <Button onClick={onNewTranscript} size="sm" className="bg-white/20 hover:bg-white/30 text-white">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        <div className="text-sm text-white/70 truncate">{user.email}</div>
      </div>

      {/* Transcripts list */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center text-white/50 py-8">Loading...</div>
        ) : transcripts.length === 0 ? (
          <div className="text-center text-white/50 py-8">No transcripts yet</div>
        ) : (
          <div className="space-y-2">
            {transcripts.map((transcript) => (
              <motion.div
                key={transcript.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  currentTranscriptId === transcript.id ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => onLoadTranscript(transcript)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium line-clamp-2 mb-1">
                      {transcript.content.slice(0, 60) || "Empty transcript"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(transcript.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-white/70 hover:text-red-400 hover:bg-red-500/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTranscript(transcript.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <Button
          onClick={onSignOut}
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  )
}
