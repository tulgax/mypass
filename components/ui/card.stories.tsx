import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "./button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"

const meta = {
  title: "UI/Card",
  component: Card,
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Studio membership</CardTitle>
        <CardDescription>
          Upgrade to unlock unlimited classes and priority booking.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Includes access to all locations and member-only events.
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Upgrade</Button>
        <Button variant="outline">Learn more</Button>
      </CardFooter>
    </Card>
  ),
}
