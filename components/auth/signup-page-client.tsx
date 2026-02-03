"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { uploadStudioImage, validateImageFileForUpload } from "@/lib/utils/image-upload"

const COUNTRIES = [
  "United States",
  "Mongolia",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "India",
]

type AccountType = "student" | "studio"

interface SignUpPageClientProps {
  initialError?: string
}

export function SignUpPageClient({ initialError }: SignUpPageClientProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("auth.signUp")
  const tCommon = useTranslations("common")
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [error, setError] = useState<string | null>(initialError || null)
  const [isLoading, setIsLoading] = useState(false)

  // Student form
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Studio step 1
  const [studioStep, setStudioStep] = useState(1)
  const [studioFullName, setStudioFullName] = useState("")
  const [studioPhone, setStudioPhone] = useState("")
  const [studioBusinessName, setStudioBusinessName] = useState("")
  const [studioCountry, setStudioCountry] = useState("")
  const [studioEmail, setStudioEmail] = useState("")
  const [studioPassword, setStudioPassword] = useState("")

  // Studio step 2
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [slug, setSlug] = useState("")
  const [slugError, setSlugError] = useState<string | null>(null)

  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!val) {
      setEmailError(t("emailRequired"))
      return false
    }
    if (!emailRegex.test(val)) {
      setEmailError(t("emailInvalid"))
      return false
    }
    setEmailError(null)
    return true
  }

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError(t("passwordRequired"))
      return false
    }
    if (val.length < 6) {
      setPasswordError(t("passwordMinLength"))
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleSocialSignUp = async (provider: "google" | "facebook") => {
    if (accountType !== "student") return
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/${locale}/auth/callback`,
        },
      })
      if (oauthError) {
        setError(`Could not authenticate with ${provider}`)
        setIsLoading(false)
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError(`Could not authenticate with ${provider}`)
      setIsLoading(false)
    }
  }

  const handleStudentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!validateEmail(email) || !validatePassword(password)) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (authError) {
        setError(authError.message || t("createAccountError"))
        setIsLoading(false)
        return
      }
      if (authData.user) {
        await (supabase as any)
          .from("user_profiles")
          .upsert(
            {
              id: authData.user.id,
              role: "student",
              full_name: fullName,
            },
            { onConflict: "id" }
          )
        router.push(`/${locale}/student`)
        router.refresh()
      }
    } catch {
      setError(t("createAccountError"))
    }
    setIsLoading(false)
  }

  const handleStudioStep1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (
      !validateEmail(studioEmail) ||
      !validatePassword(studioPassword) ||
      !studioFullName.trim() ||
      !studioBusinessName.trim() ||
      !studioCountry
    ) {
      return
    }
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studioEmail,
        password: studioPassword,
      })
      if (authError) {
        setError(authError.message || t("createAccountError"))
        setIsLoading(false)
        return
      }
      if (authData.user) {
        const { error: profileError } = await (supabase as any)
          .from("user_profiles")
          .upsert(
            {
              id: authData.user.id,
              role: "studio_owner",
              full_name: studioFullName,
              phone: studioPhone || null,
            },
            { onConflict: "id" }
          )
        if (profileError) {
          setError(t("createProfileError"))
          setIsLoading(false)
          return
        }
        setStudioStep(2)
      }
    } catch {
      setError(t("createAccountError"))
    }
    setIsLoading(false)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateImageFileForUpload(file)
    if (!validation.valid) {
      setError(validation.error || "Invalid file")
      return
    }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateImageFileForUpload(file)
    if (!validation.valid) {
      setError(validation.error || "Invalid file")
      return
    }
    setCoverFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleStudioStep2Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSlugError(null)
    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    if (!normalizedSlug) {
      setSlugError("URL slug is required")
      return
    }
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError(t("createAccountError"))
        setIsLoading(false)
        return
      }
      const { data: existing } = await supabase
        .from("studios")
        .select("id")
        .eq("slug", normalizedSlug)
        .maybeSingle()
      if (existing) {
        setSlugError(t("slugTaken"))
        setIsLoading(false)
        return
      }
      const { data: newStudio, error: studioError } = await supabase
        .from("studios")
        .insert({
          owner_id: user.id,
          name: studioBusinessName,
          slug: normalizedSlug,
          country: studioCountry || null,
        })
        .select("id")
        .single()
      if (studioError) {
        if (studioError.code === "23505") {
          setSlugError(t("slugTaken"))
        } else {
          setError(t("createStudioError"))
        }
        setIsLoading(false)
        return
      }
      let logoUrl: string | null = null
      let coverUrl: string | null = null
      if (logoFile && newStudio) {
        const uploadResult = await uploadStudioImage(logoFile, newStudio.id, "logo")
        if (!uploadResult.success) {
          setError(uploadResult.error || "Failed to upload logo")
          setIsLoading(false)
          return
        }
        logoUrl = uploadResult.url
      }
      if (coverFile && newStudio) {
        const uploadResult = await uploadStudioImage(coverFile, newStudio.id, "cover")
        if (!uploadResult.success) {
          setError(uploadResult.error || "Failed to upload cover")
          setIsLoading(false)
          return
        }
        coverUrl = uploadResult.url
      }
      if (logoUrl || coverUrl) {
        await supabase
          .from("studios")
          .update({
            ...(logoUrl && { logo_url: logoUrl }),
            ...(coverUrl && { cover_image_url: coverUrl }),
          })
          .eq("id", newStudio.id)
      }
      router.push(`/${locale}/studio`)
      router.refresh()
    } catch {
      setError(t("createStudioError"))
    }
    setIsLoading(false)
  }

  if (accountType === null) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAccountType("student")}
            className="flex flex-col items-start gap-2 rounded-lg border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
          >
            <div className="h-4 w-4 rounded-full border-2 border-foreground" />
            <div className="font-medium">{t("student")}</div>
            <div className="text-sm text-muted-foreground">{t("studentDescription")}</div>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("studio")}
            className="flex flex-col items-start gap-2 rounded-lg border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
          >
            <div className="h-4 w-4 rounded-full border-2 border-foreground" />
            <div className="font-medium">{t("studio")}</div>
            <div className="text-sm text-muted-foreground">{t("studioDescription")}</div>
          </button>
        </div>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t("alreadyHaveAccount")} </span>
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            {t("signInLink")}
          </Link>
        </div>
      </div>
    )
  }

  if (accountType === "student") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setAccountType(null)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {tCommon("back")}
        </button>
        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center gap-3 bg-muted hover:bg-muted/80"
            disabled={isLoading}
            onClick={() => handleSocialSignUp("google")}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t("continueWithGoogle")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center gap-3 bg-muted hover:bg-muted/80"
            disabled={isLoading}
            onClick={() => handleSocialSignUp("facebook")}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {t("continueWithFacebook")}
          </Button>
        </div>
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">{t("or")}</span>
        </div>
        <form onSubmit={handleStudentSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="student-full-name">{t("fullName")}</Label>
            <Input
              id="student-full-name"
              placeholder={t("fullNamePlaceholder")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-email">{t("email")}</Label>
            <Input
              id="student-email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError(null)
              }}
              onBlur={() => validateEmail(email)}
              disabled={isLoading}
              className="h-11"
              aria-invalid={!!emailError}
            />
            {emailError && <p className="text-sm text-destructive">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-password">{t("password")}</Label>
            <Input
              id="student-password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(null)
              }}
              onBlur={() => validatePassword(password)}
              disabled={isLoading}
              className="h-11"
              aria-invalid={!!passwordError}
              minLength={6}
            />
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon("loading")}
              </>
            ) : (
              tCommon("continue")
            )}
          </Button>
        </form>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t("alreadyHaveAccount")} </span>
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            {t("signInLink")}
          </Link>
        </div>
      </div>
    )
  }

  if (accountType === "studio" && studioStep === 1) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setAccountType(null)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {tCommon("back")}
        </button>
        <h2 className="text-center font-medium">{t("step1Title")}</h2>
        <form onSubmit={handleStudioStep1Submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="studio-full-name">{t("fullName")}</Label>
            <Input
              id="studio-full-name"
              placeholder={t("fullNamePlaceholder")}
              value={studioFullName}
              onChange={(e) => setStudioFullName(e.target.value)}
              disabled={isLoading}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studio-phone">{t("phone")}</Label>
            <Input
              id="studio-phone"
              type="tel"
              placeholder={t("phonePlaceholder")}
              value={studioPhone}
              onChange={(e) => setStudioPhone(e.target.value)}
              disabled={isLoading}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studio-business-name">{t("businessName")}</Label>
            <Input
              id="studio-business-name"
              placeholder={t("businessNamePlaceholder")}
              value={studioBusinessName}
              onChange={(e) => setStudioBusinessName(e.target.value)}
              disabled={isLoading}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studio-country">{t("country")}</Label>
            <Select value={studioCountry} onValueChange={setStudioCountry} required>
              <SelectTrigger id="studio-country" className="h-11">
                <SelectValue placeholder={t("countryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="studio-email">{t("email")}</Label>
            <Input
              id="studio-email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={studioEmail}
              onChange={(e) => {
                setStudioEmail(e.target.value)
                setEmailError(null)
              }}
              onBlur={() => validateEmail(studioEmail)}
              disabled={isLoading}
              className="h-11"
              aria-invalid={!!emailError}
            />
            {emailError && <p className="text-sm text-destructive">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="studio-password">{t("password")}</Label>
            <Input
              id="studio-password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={studioPassword}
              onChange={(e) => {
                setStudioPassword(e.target.value)
                setPasswordError(null)
              }}
              onBlur={() => validatePassword(studioPassword)}
              disabled={isLoading}
              className="h-11"
              aria-invalid={!!passwordError}
              minLength={6}
            />
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon("loading")}
              </>
            ) : (
              tCommon("continue")
            )}
          </Button>
        </form>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t("alreadyHaveAccount")} </span>
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            {t("signInLink")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-center font-medium">{t("step2Title")}</h2>
      <form onSubmit={handleStudioStep2Submit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label>{t("profilePhoto")}</Label>
          <p className="text-xs text-muted-foreground">{t("profilePhotoDescription")}</p>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
                <Image src={logoPreview} alt="Logo" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null)
                    setLogoPreview(null)
                  }}
                  className="absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
              </label>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("coverPhoto")}</Label>
          <p className="text-xs text-muted-foreground">{t("coverPhotoDescription")}</p>
          {coverPreview ? (
            <div className="relative h-32 w-full overflow-hidden rounded-lg border">
              <Image src={coverPreview} alt="Cover" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null)
                  setCoverPreview(null)
                }}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
            </label>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="studio-slug">{t("urlSlug")}</Label>
          <p className="text-xs text-muted-foreground">{t("urlSlugDescription")}</p>
          <div className="flex rounded-md border border-input bg-background">
            <span className="flex items-center px-3 text-sm text-muted-foreground">{t("urlSlugPrefix")}</span>
            <Input
              id="studio-slug"
              placeholder="asm-studio"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugError(null)
              }}
              disabled={isLoading}
              className="h-11 border-0"
              required
            />
          </div>
          {slugError && <p className="text-sm text-destructive">{slugError}</p>}
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tCommon("loading")}
            </>
          ) : (
            tCommon("continue")
          )}
        </Button>
      </form>
      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t("alreadyHaveAccount")} </span>
        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
          {t("signInLink")}
        </Link>
      </div>
    </div>
  )
}
