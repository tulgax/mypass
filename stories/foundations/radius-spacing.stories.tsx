import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "Foundations/RadiusAndSpacing",
  parameters: {
    layout: "padded",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const radiusSamples = [
  { label: "rounded-sm", className: "rounded-sm" },
  { label: "rounded-md", className: "rounded-md" },
  { label: "rounded-lg", className: "rounded-lg" },
  { label: "rounded-xl", className: "rounded-xl" },
  { label: "rounded-2xl", className: "rounded-2xl" },
  { label: "rounded-3xl", className: "rounded-3xl" },
  { label: "rounded-4xl", className: "rounded-4xl" },
]

const spacingSamples = [
  { label: "p-2", className: "p-2" },
  { label: "p-4", className: "p-4" },
  { label: "p-6", className: "p-6" },
  { label: "p-8", className: "p-8" },
]

export const Radius: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {radiusSamples.map((sample) => (
        <div key={sample.label} className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {sample.label}
          </div>
          <div
            className={`h-16 w-full border border-border/60 bg-card ${sample.className}`}
          />
        </div>
      ))}
    </div>
  ),
}

export const Spacing: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {spacingSamples.map((sample) => (
        <div key={sample.label} className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {sample.label}
          </div>
          <div
            className={`rounded-lg border border-border/60 bg-muted ${sample.className}`}
          >
            <div className="h-8 rounded-md bg-primary/20" />
          </div>
        </div>
      ))}
    </div>
  ),
}
