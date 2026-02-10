import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "./button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./button-group"

const meta = {
  title: "UI/ButtonGroup",
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button size="sm">Day</Button>
      <Button size="sm" variant="secondary">
        Week
      </Button>
      <Button size="sm" variant="secondary">
        Month
      </Button>
    </ButtonGroup>
  ),
}

export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>Filter</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button size="sm">Active</Button>
      <Button size="sm" variant="secondary">
        Archived
      </Button>
    </ButtonGroup>
  ),
}
