'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { MoreHorizontal, UserPlus, Shield, Users, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  inviteTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
} from '@/lib/actions/team'
import type { TeamMemberRow } from '@/lib/data/studio-team'

interface TeamClientProps {
  studioId: number
  currentUserId: string
  teamRows: TeamMemberRow[]
  instructorStatsMap?: Record<string, { classesTaught: number; hoursTaught: number }>
  canManageTeam?: boolean
}

function RoleBadge({ role, t }: { role: string; t: (key: string) => string }) {
  if (role === 'owner') {
    return (
      <Badge variant="default" className="gap-1">
        <Crown className="h-3 w-3" />
        {t('roleOwner')}
      </Badge>
    )
  }
  if (role === 'manager') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Shield className="h-3 w-3" />
        {t('roleManager')}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Users className="h-3 w-3" />
      {t('roleInstructor')}
    </Badge>
  )
}

function formatDate(dateStr: string, locale: string) {
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'mn' ? 'mn-MN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function TeamClient({ studioId, currentUserId, teamRows, instructorStatsMap = {}, canManageTeam = true }: TeamClientProps) {
  const t = useTranslations('studio.settings.team')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'manager' | 'instructor'>('instructor')
  const [isPending, startTransition] = useTransition()
  const [removeTarget, setRemoveTarget] = useState<TeamMemberRow | null>(null)
  const [removePending, setRemovePending] = useState(false)

  // Detect locale from pathname
  const locale =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/mn')
      ? 'mn'
      : 'en'

  const handleInvite = () => {
    startTransition(async () => {
      const result = await inviteTeamMember({
        studio_id: studioId,
        email: email.trim(),
        role,
      })
      if (result.success) {
        toast.success(t('inviteSuccess'))
        setInviteOpen(false)
        setEmail('')
        setRole('instructor')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleChangeRole = (
    member: TeamMemberRow,
    newRole: 'manager' | 'instructor'
  ) => {
    if (member.role === newRole) return
    startTransition(async () => {
      const result = await updateTeamMemberRole({
        studio_id: studioId,
        user_id: member.user_id,
        role: newRole,
      })
      if (result.success) {
        toast.success(t('updateSuccess'))
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleRemoveConfirm = () => {
    if (!removeTarget) return
    setRemovePending(true)
    startTransition(async () => {
      const result = await removeTeamMember({
        studio_id: studioId,
        user_id: removeTarget.user_id,
      })
      if (result.success) {
        toast.success(t('removeSuccess'))
        setRemoveTarget(null)
        router.refresh()
      } else {
        toast.error(result.error)
      }
      setRemovePending(false)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {canManageTeam && (
          <Button onClick={() => setInviteOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t('inviteMember')}
          </Button>
        )}
      </div>

      {/* Team table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{t('title')}</CardTitle>
              <CardDescription>
                {t('totalMembers', { count: teamRows.length })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colMember')}</TableHead>
                <TableHead>{t('colEmail')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('colPhone')}</TableHead>
                <TableHead>{t('colRole')}</TableHead>
                <TableHead className="hidden lg:table-cell text-right">{t('colClassesTaught')}</TableHead>
                <TableHead className="hidden lg:table-cell text-right">{t('colHoursTaught')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('colJoined')}</TableHead>
                <TableHead className="w-12.5">
                  <span className="sr-only">{t('colActions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamRows.map((row) => {
                const isOwner = row.role === 'owner'
                const isCurrentUser = row.user_id === currentUserId

                return (
                  <TableRow key={row.user_id}>
                    {/* Member */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={row.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {row.full_name?.[0]?.toUpperCase() ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {row.full_name ?? '—'}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {t('you')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {row.email ?? '—'}
                      </span>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {row.phone ?? '—'}
                      </span>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <RoleBadge role={row.role} t={t} />
                    </TableCell>

                    {/* Classes Taught */}
                    <TableCell className="hidden lg:table-cell text-right">
                      <span className="text-sm tabular-nums">
                        {instructorStatsMap[row.user_id]?.classesTaught ?? '—'}
                      </span>
                    </TableCell>

                    {/* Hours Taught */}
                    <TableCell className="hidden lg:table-cell text-right">
                      <span className="text-sm tabular-nums">
                        {instructorStatsMap[row.user_id]?.hoursTaught ?? '—'}
                      </span>
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(row.joined_at, locale)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      {canManageTeam && !isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">{t('manage')}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(row, 'manager')}
                              disabled={row.role === 'manager' || isPending}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {t('roleManager')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(row, 'instructor')}
                              disabled={row.role === 'instructor' || isPending}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              {t('roleInstructor')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setRemoveTarget(row)}
                              disabled={isPending}
                            >
                              {t('removeMember')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}

              {teamRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <p className="text-muted-foreground">{t('noMembers')}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('inviteDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('inviteDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">{t('emailLabel')}</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('roleLabel')}</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as 'manager' | 'instructor')}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">{t('roleManager')}</SelectItem>
                  <SelectItem value="instructor">
                    {t('roleInstructor')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteOpen(false)}
              disabled={isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleInvite}
              disabled={isPending || !email.trim()}
            >
              {isPending ? '\u2026' : t('inviteButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) =>
          !removePending && !open && setRemoveTarget(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('removeConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('removeConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removePending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleRemoveConfirm}
              disabled={removePending}
            >
              {removePending ? t('removing') : t('removeMember')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
