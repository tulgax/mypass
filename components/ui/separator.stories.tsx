import type { Meta, StoryObj } from "@storybook/react"

import { Separator } from "./separator"

const meta = {
  title: "UI/Separator",
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="h-16 w-24 rounded-md bg-muted" />
      <Separator orientation="vertical" className="h-16" />
      <div className="h-16 w-24 rounded-md bg-muted" />
    </div>
  ),
}
