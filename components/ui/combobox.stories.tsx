import type { Meta, StoryObj } from "@storybook/react"

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxCollection,
} from "./combobox"

const meta = {
  title: "UI/Combobox",
  component: Combobox,
} satisfies Meta<typeof Combobox>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Select a class type" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxCollection>
            <ComboboxItem value="yoga">Yoga</ComboboxItem>
            <ComboboxItem value="pilates">Pilates</ComboboxItem>
            <ComboboxItem value="hiit">HIIT</ComboboxItem>
            <ComboboxItem value="strength">Strength</ComboboxItem>
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
}
