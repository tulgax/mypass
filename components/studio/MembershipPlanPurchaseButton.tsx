"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { purchaseMembership } from "@/lib/actions/memberships"
import { toast } from "sonner"
import type { Tables } from "@/lib/types/database"

type MembershipPlan = Tables<"membership_plans">

interface MembershipPlanPurchaseButtonProps {
  plan: MembershipPlan
  studioId: number
  locale: string
}

export function MembershipPlanPurchaseButton({
  plan,
  studioId,
  locale,
}: MembershipPlanPurchaseButtonProps) {
  const router = useRouter()
  const t = useTranslations("landing.bookingPage")
  const { user, loading: authLoading } = useAuth()
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePurchase = async () => {
    if (!user) return
    setIsPurchasing(true)
    try {
      const result = await purchaseMembership({
        membership_plan_id: plan.id,
        studio_id: studioId,
      })
      if (result.success) {
        toast.success(t("membership.purchaseSuccess"))
        router.push(`/${locale}/student/memberships`)
        router.refresh()
      } else {
        toast.error(result.error || t("membership.purchaseError"))
      }
    } catch {
      toast.error(t("membership.purchaseError"))
    } finally {
      setIsPurchasing(false)
    }
  }

  if (authLoading) {
    return (
      <Button size="sm" disabled className="shrink-0">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button size="sm" variant="outline" className="shrink-0" asChild>
        <Link href="/auth/signin">{t("membership.signInToPurchase")}</Link>
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      onClick={handlePurchase}
      disabled={isPurchasing}
      className="shrink-0"
    >
      {isPurchasing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        t("membership.purchase")
      )}
    </Button>
  )
}
