import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const email = "lethalstaff@gmail.com"
  const password = "Mkmkpouo13"

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users?.find((u) => u.email === email)

  if (existing) {
    console.log("Admin user already exists:", existing.id)
    // Make sure they're in profiles as admin
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: existing.id, email, role: "admin", display_name: "Lethal Staff" })
    if (error) console.error("Profile upsert error:", error)
    else console.log("Profile confirmed as admin")
    return
  }

  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error("Error creating admin user:", error)
    return
  }

  console.log("Admin user created:", data.user.id)

  // Insert profile as admin
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email,
    role: "admin",
    display_name: "Lethal Staff",
  })

  if (profileError) console.error("Profile error:", profileError)
  else console.log("Admin profile created successfully")
}

main()
