import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "padded",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const samples = [
  { label: "Display", className: "text-4xl font-semibold" },
  { label: "Heading XL", className: "text-3xl font-semibold" },
  { label: "Heading LG", className: "text-2xl font-semibold" },
  { label: "Heading MD", className: "text-xl font-semibold" },
  { label: "Heading SM", className: "text-lg font-semibold" },
  { label: "Body LG", className: "text-base" },
  { label: "Body MD", className: "text-sm" },
  { label: "Body SM", className: "text-xs" },
]

export const Scale: Story = {
  render: () => (
    <div className="space-y-6">
      {samples.map((sample) => (
        <div key={sample.label} className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {sample.label}
          </div>
          <div className={sample.className}>
            The quick brown fox jumps over the lazy dog.
          </div>
        </div>
      ))}
    </div>
  ),
}
