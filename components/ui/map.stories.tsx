import type { Meta, StoryObj } from "@storybook/react"

import { StudioMap } from "./map"

const meta = {
  title: "UI/Map",
  component: StudioMap,
} satisfies Meta<typeof StudioMap>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    latitude: 47.8864,
    longitude: 106.9057,
    address: "Ulaanbaatar, Mongolia",
    height: "320px",
  },
}
