import type { Meta, StoryObj } from "@storybook/react"
import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "./input-group"

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <InputGroup className="max-w-md">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search classes" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Go</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithText: Story = {
  render: () => (
    <InputGroup className="max-w-md">
      <InputGroupAddon>
        <InputGroupText>USD</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="0.00" />
    </InputGroup>
  ),
}
