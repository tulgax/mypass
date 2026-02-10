import type { Meta, StoryObj } from "@storybook/react"

import { CtaButton } from "./cta-button"

const meta = {
  title: "UI/CtaButton",
  component: CtaButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "CTA buttons highlight a primary action, often on landing pages. Use sparingly and keep the label action-oriented.",
      },
    },
  },
  args: {
    children: "Start membership",
    variant: "default",
    size: "lg",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "link", "destructive"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    asChild: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof CtaButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <CtaButton>Start membership</CtaButton>
      <CtaButton variant="secondary">View plans</CtaButton>
      <CtaButton variant="outline">Learn more</CtaButton>
    </div>
  ),
}
