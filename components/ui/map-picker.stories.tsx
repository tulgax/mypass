import type { Meta, StoryObj } from "@storybook/react"

import { MapPicker } from "./map-picker"

const meta = {
  title: "UI/MapPicker",
  component: MapPicker,
} satisfies Meta<typeof MapPicker>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    latitude: 47.8864,
    longitude: 106.9057,
    height: "320px",
    onLocationSelect: () => {},
  },
}
