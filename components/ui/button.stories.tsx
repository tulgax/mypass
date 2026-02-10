import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, within } from "storybook/test"

import { Button } from "./button"

const meta = {
  title: "UI/Button",
  component: Button,
  tags: [],
  parameters: {
    docs: {
      description: {
        component:
          "Use buttons to trigger actions. Prefer `default` for the primary action, and use `secondary` or `outline` for supporting actions. Limit `destructive` to irreversible actions. Use `asChild` to render a button-style link.",
      },
    },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    asChild: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const UsageGuidelines: Story = {
  render: () => (
    <div className="space-y-3 text-sm text-muted-foreground">
      <div className="font-medium text-foreground">Usage guidelines</div>
      <ul className="list-disc space-y-1 pl-4">
        <li>Use one primary button per view.</li>
        <li>Use `outline` or `secondary` for supporting actions.</li>
        <li>Reserve `destructive` for irreversible actions.</li>
        <li>Use `asChild` with an anchor for navigation.</li>
      </ul>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Guidance on how to choose button variants and usage.",
      },
    },
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Icon button">
        +
      </Button>
    </div>
  ),
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
}

export const ClickInteraction: Story = {
  args: {
    children: "Click me",
    onClick: fn(),
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole("button", { name: /click me/i }))
    await expect(args.onClick).toHaveBeenCalled()
  },
}
