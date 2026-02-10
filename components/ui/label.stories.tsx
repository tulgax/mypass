import type { Meta, StoryObj } from "@storybook/react"

import { Input } from "./input"
import { Label } from "./label"

const meta = {
  title: "UI/Label",
  component: Label,
} satisfies Meta<typeof Label>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="grid gap-2 max-w-sm">
      <Label htmlFor="studio-slug">Studio slug</Label>
      <Input id="studio-slug" placeholder="my-studio" />
    </div>
  ),
}
