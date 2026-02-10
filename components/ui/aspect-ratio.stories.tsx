import type { Meta, StoryObj } from "@storybook/react"

import { AspectRatio } from "./aspect-ratio"

const meta = {
  title: "UI/AspectRatio",
  component: AspectRatio,
} satisfies Meta<typeof AspectRatio>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
          16:9 Preview
        </div>
      </AspectRatio>
    </div>
  ),
}
