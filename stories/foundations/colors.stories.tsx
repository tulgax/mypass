import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "Foundations/Colors",
  parameters: {
    layout: "padded",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const tokens = [
  { name: "background", variable: "--background" },
  { name: "foreground", variable: "--foreground" },
  { name: "card", variable: "--card" },
  { name: "card-foreground", variable: "--card-foreground" },
  { name: "popover", variable: "--popover" },
  { name: "popover-foreground", variable: "--popover-foreground" },
  { name: "primary", variable: "--primary" },
  { name: "primary-foreground", variable: "--primary-foreground" },
  { name: "secondary", variable: "--secondary" },
  { name: "secondary-foreground", variable: "--secondary-foreground" },
  { name: "muted", variable: "--muted" },
  { name: "muted-foreground", variable: "--muted-foreground" },
  { name: "accent", variable: "--accent" },
  { name: "accent-foreground", variable: "--accent-foreground" },
  { name: "success", variable: "--success" },
  { name: "success-foreground", variable: "--success-foreground" },
  { name: "destructive", variable: "--destructive" },
  { name: "destructive-foreground", variable: "--destructive-foreground" },
  { name: "border", variable: "--border" },
  { name: "input", variable: "--input" },
  { name: "ring", variable: "--ring" },
  { name: "sidebar", variable: "--sidebar" },
  { name: "sidebar-foreground", variable: "--sidebar-foreground" },
  { name: "sidebar-primary", variable: "--sidebar-primary" },
  { name: "sidebar-primary-foreground", variable: "--sidebar-primary-foreground" },
  { name: "sidebar-accent", variable: "--sidebar-accent" },
  { name: "sidebar-accent-foreground", variable: "--sidebar-accent-foreground" },
  { name: "sidebar-border", variable: "--sidebar-border" },
  { name: "sidebar-ring", variable: "--sidebar-ring" },
]

export const Palette: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => (
        <div
          key={token.name}
          className="rounded-lg border border-border/60 bg-card p-4"
        >
          <div
            className="h-20 w-full rounded-md border border-border/60"
            style={{ backgroundColor: `var(${token.variable})` }}
          />
          <div className="mt-3 text-sm font-medium">{token.name}</div>
          <div className="text-xs text-muted-foreground">
            {`var(${token.variable})`}
          </div>
        </div>
      ))}
    </div>
  ),
}
