'use client'

import { useState, type KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WizardFormData } from './VideoClassWizard'

interface InstructorOption {
  id: string
  full_name: string | null
}

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const

const CATEGORY_SUGGESTIONS = [
  'yoga',
  'pilates',
  'hiit',
  'strength',
  'dance',
  'meditation',
  'stretching',
  'cardio',
  'other',
] as const

interface DetailsStepProps {
  formData: WizardFormData
  onUpdate: (patch: Partial<WizardFormData>) => void
  instructors: InstructorOption[]
}

export function DetailsStep({
  formData,
  onUpdate,
  instructors,
}: DetailsStepProps) {
  const t = useTranslations('studio.videoClasses')
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 20) {
        onUpdate({ tags: [...formData.tags, tag] })
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate({ tags: formData.tags.filter((tag) => tag !== tagToRemove) })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('wizard.detailsTitle')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('wizard.detailsDescription')}
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t('form.titleLabel')}</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder={t('form.titlePlaceholder')}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder={t('form.descriptionPlaceholder')}
          rows={4}
        />
      </div>

      {/* Instructor */}
      <div className="space-y-2">
        <Label>{t('form.instructorLabel')}</Label>
        <Select
          value={formData.instructor_id ?? 'none'}
          onValueChange={(v) =>
            onUpdate({ instructor_id: v === 'none' ? null : v })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('form.instructorPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('noInstructor')}</SelectItem>
            {instructors.map((inst) => (
              <SelectItem key={inst.id} value={inst.id}>
                {inst.full_name ?? inst.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>{t('form.categoryLabel')}</Label>
        <Select
          value={formData.category ?? 'none'}
          onValueChange={(v) =>
            onUpdate({ category: v === 'none' ? null : v })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('form.categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">--</SelectItem>
            {CATEGORY_SUGGESTIONS.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {t(`categories.${cat}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-2">
        <Label>{t('form.difficultyLabel')}</Label>
        <div className="flex gap-2">
          {DIFFICULTY_LEVELS.map((level) => (
            <Button
              key={level}
              type="button"
              variant={
                formData.difficulty_level === level ? 'default' : 'outline'
              }
              size="sm"
              onClick={() =>
                onUpdate({
                  difficulty_level:
                    formData.difficulty_level === level ? null : level,
                })
              }
            >
              {t(`difficulty.${level}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">{t('form.tagsLabel')}</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder={t('form.tagsPlaceholder')}
        />
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
