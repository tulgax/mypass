import type { Meta, StoryObj } from "@storybook/react"
import { SearchX } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty"
import { Button } from "./button"

const meta = {
  title: "UI/Empty",
  component: Empty,
} satisfies Meta<typeof Empty>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty className="max-w-lg">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX className="h-5 w-5" />
        </EmptyMedia>
        <EmptyTitle>No classes found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your filters or create a new class for your studio.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>New class</Button>
      </EmptyContent>
    </Empty>
  ),
}
