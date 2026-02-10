import type { Meta, StoryObj } from "@storybook/react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

const meta = {
  title: "UI/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="classes" className="max-w-md">
      <TabsList>
        <TabsTrigger value="classes">Classes</TabsTrigger>
        <TabsTrigger value="memberships">Memberships</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="classes">
        <div className="rounded-md border border-border/60 p-4 text-sm text-muted-foreground">
          Upcoming classes appear here.
        </div>
      </TabsContent>
      <TabsContent value="memberships">
        <div className="rounded-md border border-border/60 p-4 text-sm text-muted-foreground">
          Membership plans and renewals.
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="rounded-md border border-border/60 p-4 text-sm text-muted-foreground">
          Studio settings go here.
        </div>
      </TabsContent>
    </Tabs>
  ),
}
