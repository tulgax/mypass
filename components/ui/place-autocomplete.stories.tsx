import type { Meta, StoryObj } from "@storybook/react"

import { PlaceAutocomplete } from "./place-autocomplete"

const meta = {
  title: "UI/PlaceAutocomplete",
  component: PlaceAutocomplete,
  args: {
    placeholder: "Search for a place",
    onPlaceSelect: () => {},
  },
} satisfies Meta<typeof PlaceAutocomplete>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
