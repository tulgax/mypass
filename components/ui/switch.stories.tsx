import type { Meta, StoryObj } from "@storybook/react"

import { Switch } from "./switch"

const meta = {
  title: "UI/Switch",
  component: Switch,
  args: {
    defaultChecked: true,
  },
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
