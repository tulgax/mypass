import type { Meta, StoryObj } from "@storybook/react"
import { ChevronDown } from "lucide-react"

import { Button } from "./button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
} satisfies Meta<typeof Collapsible>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Collapsible className="w-full max-w-md rounded-lg border border-border/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Upcoming updates</div>
          <div className="text-xs text-muted-foreground">2 items</div>
        </div>
        <CollapsibleTrigger asChild>
          <Button size="icon" variant="ghost">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div>New class types added for spring schedule.</div>
        <div>Improved instructor onboarding workflow.</div>
      </CollapsibleContent>
    </Collapsible>
  ),
}
