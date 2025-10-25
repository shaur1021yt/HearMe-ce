import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // If user is logged in, redirect to app
  if (data?.user) {
    redirect("/app")
  }

  // Otherwise redirect to login
  redirect("/auth/login")
}
