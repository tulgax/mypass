import type { Meta, StoryObj } from "@storybook/react"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

const meta = {
  title: "UI/Avatar",
  component: Avatar,
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
        <AvatarFallback>SH</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MS</AvatarFallback>
      </Avatar>
    </div>
  ),
}
