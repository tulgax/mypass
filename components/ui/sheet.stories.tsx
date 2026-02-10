import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "./button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"

const meta = {
  title: "UI/Sheet",
  component: Sheet,
} satisfies Meta<typeof Sheet>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit studio</SheetTitle>
          <SheetDescription>
            Update studio details and save changes when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 text-sm text-muted-foreground">
          Sheet content goes here.
        </div>
      </SheetContent>
    </Sheet>
  ),
}
