import type { Meta, StoryObj } from "@storybook/react"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "./alert"

const meta = {
  title: "UI/Alert",
  component: Alert,
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        Your next class starts in 30 minutes. Confirm your attendance.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>
        Update your payment method to keep your membership active.
      </AlertDescription>
    </Alert>
  ),
}
