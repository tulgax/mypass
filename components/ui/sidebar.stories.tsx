import type { Meta, StoryObj } from "@storybook/react"
import { NextIntlClientProvider } from "next-intl"
import { Home, LayoutGrid, Settings } from "lucide-react"

import { Button } from "./button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar"

const meta = {
  title: "UI/Sidebar",
  component: Sidebar,
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

const messages = {
  dashboard: {
    sidebar: {
      toggleSidebar: "Toggle sidebar",
    },
  },
}

export const Default: Story = {
  render: () => (
    <NextIntlClientProvider locale="en" messages={messages}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Studio</div>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Home />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <LayoutGrid />
                      <span>Classes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-6">
            <h2 className="text-lg font-semibold">Studio overview</h2>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate between studio sections.
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </NextIntlClientProvider>
  ),
}
