import type { Meta, StoryObj } from "@storybook/react"

import { StatusBadge } from "./status-badge"

const meta = {
  title: "UI/StatusBadge",
  component: StatusBadge,
} satisfies Meta<typeof StatusBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
