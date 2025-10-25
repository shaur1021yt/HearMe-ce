import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppWithHistory } from "@/components/app-with-history"

export default async function AppPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <AppWithHistory user={data.user} />
}
