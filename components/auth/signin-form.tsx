"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface SignInFormProps {
  initialError?: string
}

export function SignInForm({ initialError }: SignInFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(initialError || null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError(null)
    return true
  }

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required")
      return false
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate inputs
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || "Could not authenticate user")
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Get user profile to determine redirect
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (profile?.role === "studio_owner") {
          router.push("/dashboard")
        } else {
          router.push("/student")
        }
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError(null)
          }}
          onBlur={() => validateEmail(email)}
          disabled={isLoading}
          className="h-11"
          aria-invalid={emailError ? "true" : "false"}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        {emailError && (
          <p id="email-error" className="text-sm text-destructive">
            {emailError}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) setPasswordError(null)
          }}
          onBlur={() => validatePassword(password)}
          disabled={isLoading}
          className="h-11"
          aria-invalid={passwordError ? "true" : "false"}
          aria-describedby={passwordError ? "password-error" : undefined}
        />
        {passwordError && (
          <p id="password-error" className="text-sm text-destructive">
            {passwordError}
          </p>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  )
}
