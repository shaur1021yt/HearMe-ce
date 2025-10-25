"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { HearMeApp } from "@/components/hear-me-app"
import { HistorySidebar } from "@/components/history-sidebar"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { AnimatePresence } from "framer-motion"

interface Transcript {
  id: string
  content: string
  language: string
  created_at: string
  updated_at: string
}

interface AppWithHistoryProps {
  user: User
}

export function AppWithHistory({ user }: AppWithHistoryProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [currentTranscriptId, setCurrentTranscriptId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTranscripts()
  }, [])

  const loadTranscripts = async () => {
    const supabase = createClient()
    setIsLoading(true)

    const { data, error } = await supabase.from("transcripts").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setTranscripts(data)
    }
    setIsLoading(false)
  }

  const saveTranscript = async (content: string, language: string) => {
    const supabase = createClient()

    if (currentTranscriptId) {
      // Update existing transcript
      const { error } = await supabase
        .from("transcripts")
        .update({ content, language, updated_at: new Date().toISOString() })
        .eq("id", currentTranscriptId)

      if (!error) {
        await loadTranscripts()
      }
    } else {
      // Create new transcript
      const { data, error } = await supabase
        .from("transcripts")
        .insert({ content, language, user_id: user.id })
        .select()
        .single()

      if (!error && data) {
        setCurrentTranscriptId(data.id)
        await loadTranscripts()
      }
    }
  }

  const loadTranscript = (transcript: Transcript) => {
    setCurrentTranscriptId(transcript.id)
    setIsSidebarOpen(false)
  }

  const createNewTranscript = () => {
    setCurrentTranscriptId(null)
    setIsSidebarOpen(false)
  }

  const deleteTranscript = async (id: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("transcripts").delete().eq("id", id)

    if (!error) {
      if (currentTranscriptId === id) {
        setCurrentTranscriptId(null)
      }
      await loadTranscripts()
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const currentTranscript = transcripts.find((t) => t.id === currentTranscriptId)

  return (
    <div className="relative min-h-screen">
      {/* Mobile menu button */}
      <Button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass"
        size="icon"
        variant="ghost"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <HistorySidebar
            transcripts={transcripts}
            currentTranscriptId={currentTranscriptId}
            isLoading={isLoading}
            user={user}
            onLoadTranscript={loadTranscript}
            onNewTranscript={createNewTranscript}
            onDeleteTranscript={deleteTranscript}
            onSignOut={handleSignOut}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main app */}
      <div className="lg:ml-80">
        <HearMeApp
          initialTranscript={currentTranscript?.content || ""}
          initialLanguage={currentTranscript?.language || "en-US"}
          onSave={saveTranscript}
        />
      </div>
    </div>
  )
}
