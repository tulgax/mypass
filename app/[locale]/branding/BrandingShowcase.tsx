"use client"

import * as React from "react"
import Image from "next/image"
import {
  BluetoothIcon,
  ChevronRight,
  Info,
  MoreHorizontal,
  Plus,
  Terminal,
} from "lucide-react"

import { Example, ExampleWrapper } from "@/components/example"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { CtaButton } from "@/components/ui/cta-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DateSelector, type DateItem } from "@/components/custom/DateSelector"
import { ClassList, type ClassSession } from "@/components/custom/ClassList"
import { BundleCard } from "@/components/custom/BundleCard"
import { AnimatedTabs, type TabItem } from "@/components/custom/AnimatedTabs"

const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"] as const

type ColorToken = {
  name: string
  bgClass: string
  fgClass?: string
  meta?: string
}

function ColorSwatch({ token }: { token: ColorToken }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{token.name}</div>
        {token.meta ? (
          <div className="mt-0.5 text-xs text-muted-foreground">{token.meta}</div>
        ) : null}
      </div>
      <div
        className={[
          "h-10 w-16 shrink-0 rounded-md border",
          token.bgClass,
          token.fgClass ?? "",
        ].join(" ")}
        aria-hidden="true"
        title={token.name}
      />
    </div>
  )
}

export function BrandingShowcase() {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(true)

  return (
    <ExampleWrapper className="pt-4 content-start">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-semibold">Branding</h1>
        <p className="text-sm text-muted-foreground">
          Visual reference for UI components and variants.
        </p>
      </div>

      <div className="md:col-span-2">
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="introduction">Introduction</TabsTrigger>
            <TabsTrigger value="foundation">Foundation</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="introduction">
            <div className="grid gap-8 md:grid-cols-2">
              <Example title="What is this page?">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    This page is a visual reference for MyPass UI: typography, color
                    tokens, and the shadcn-style components used across the app.
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Use it to check spacing, hover/focus states, and variants.</li>
                    <li>Use it to spot regressions after styling changes.</li>
                    <li>Use it to agree on “what good looks like” for new UI.</li>
                  </ul>
                </div>
              </Example>

              <Example title="How to use">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    When you add a new UI primitive or variant, extend the “Components”
                    tab with a small demo and real-ish content.
                  </p>
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      Tip
                    </div>
                    <div className="mt-1 text-sm">
                      Keep demos small and consistent so you can scan quickly.
                    </div>
                  </div>
                </div>
              </Example>
            </div>
          </TabsContent>

          <TabsContent value="foundation">
            <div className="grid gap-8 md:grid-cols-2">
              <Example title="Core tokens">
                <div className="grid gap-3">
                  {(
                    [
                      { name: "background", bgClass: "bg-background", meta: "--background" },
                      { name: "card", bgClass: "bg-card", meta: "--card" },
                      { name: "popover", bgClass: "bg-popover", meta: "--popover" },
                      {
                        name: "primary",
                        bgClass: "bg-primary",
                        fgClass: "text-primary-foreground",
                        meta: "--primary / --primary-foreground",
                      },
                      {
                        name: "secondary",
                        bgClass: "bg-secondary",
                        fgClass: "text-secondary-foreground",
                        meta: "--secondary / --secondary-foreground",
                      },
                      {
                        name: "muted",
                        bgClass: "bg-muted",
                        fgClass: "text-muted-foreground",
                        meta: "--muted / --muted-foreground",
                      },
                      {
                        name: "accent",
                        bgClass: "bg-accent",
                        fgClass: "text-accent-foreground",
                        meta: "--accent / --accent-foreground",
                      },
                      {
                        name: "destructive",
                        bgClass: "bg-destructive",
                        fgClass: "text-destructive-foreground",
                        meta: "--destructive",
                      },
                      {
                        name: "success",
                        bgClass: "bg-success",
                        fgClass: "text-success-foreground",
                        meta: "--success / --success-foreground",
                      },
                    ] satisfies ColorToken[]
                  ).map((token) => (
                    <ColorSwatch key={token.name} token={token} />
                  ))}
                </div>
              </Example>

              <Example title="Borders & sidebar">
                <div className="grid gap-3">
                  {(
                    [
                      {
                        name: "border",
                        bgClass: "bg-background border-border",
                        meta: "--border",
                      },
                      {
                        name: "input",
                        bgClass: "bg-background border-input",
                        meta: "--input",
                      },
                      {
                        name: "ring",
                        bgClass: "bg-background border-ring",
                        meta: "--ring",
                      },
                      {
                        name: "sidebar",
                        bgClass: "bg-sidebar",
                        meta: "--sidebar",
                      },
                      {
                        name: "sidebar accent",
                        bgClass: "bg-sidebar-accent",
                        meta: "--sidebar-accent",
                      },
                      {
                        name: "sidebar primary",
                        bgClass: "bg-sidebar-primary",
                        meta: "--sidebar-primary",
                      },
                    ] satisfies ColorToken[]
                  ).map((token) => (
                    <ColorSwatch key={token.name} token={token} />
                  ))}
                </div>
              </Example>
            </div>
          </TabsContent>

          <TabsContent value="components">
            <div className="grid gap-8 md:grid-cols-2">
              <Example title="Button">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon" aria-label="Icon button">
                    <Plus />
                  </Button>
                </div>
              </Example>

              <Example title="Badge">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="ghost">Ghost</Badge>
                  <Badge variant="link" asChild>
                    <a href="#">Link</a>
                  </Badge>
                </div>
              </Example>

              <Example title="Status badge">
                <StatusBadge />
              </Example>

              <Example title="Alert">
                <div className="space-y-3">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Heads up</AlertTitle>
                    <AlertDescription>
                      This is a default alert. Use it to highlight important info.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Something went wrong</AlertTitle>
                    <AlertDescription>Try again later.</AlertDescription>
                  </Alert>
                </div>
              </Example>

              <Example title="Card">
                <Card className="max-w-sm">
                  <CardHeader>
                    <CardTitle>Card title</CardTitle>
                    <CardDescription>Card description goes here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is content inside a card.
                    </p>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button size="sm">Action</Button>
                    <Button size="sm" variant="outline">
                      Secondary
                    </Button>
                  </CardFooter>
                </Card>
              </Example>

              <Example title="Input + Label">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="branding-email">Email</Label>
                    <Input id="branding-email" placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branding-disabled">Disabled</Label>
                    <Input id="branding-disabled" placeholder="Disabled" disabled />
                  </div>
                </div>
              </Example>

              <Example title="Input group">
                <div className="space-y-3">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>@</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="username" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <InputGroupText>USD</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="0.00" inputMode="decimal" />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>
                        <kbd data-slot="kbd">⌘K</kbd>
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </Example>

              <Example title="Textarea">
                <Textarea placeholder="Write something…" />
              </Example>

              <Example title="Select">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Default (shadcn)
                    </div>
                    <Select defaultValue="mn">
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mn">Монгол</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Mira
                    </div>
                    <Select defaultValue="mn">
                      <SelectTrigger variant="mira" className="w-[220px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mn">Монгол</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Example>

              <Example title="Combobox">
                <Combobox items={frameworks}>
                  <ComboboxInput placeholder="Select a framework" showClear />
                  <ComboboxContent>
                    <ComboboxEmpty>No results.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Example>

              <Example title="Field">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="branding-field-name">Name</FieldLabel>
                    <Input id="branding-field-name" placeholder="Jane Doe" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="branding-field-notes">Notes</FieldLabel>
                    <Textarea id="branding-field-notes" placeholder="Optional…" />
                  </Field>
                </FieldGroup>
              </Example>

              <Example title="Separator">
                <div className="w-full">
                  <div className="text-sm">Above</div>
                  <Separator className="my-3" />
                  <div className="text-sm">Below</div>
                </div>
              </Example>

              <Example title="Skeleton">
                <div className="w-full space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-24 w-full" />
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              </Example>

              <Example title="Avatar">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/vercel.svg" alt="Avatar" />
                    <AvatarFallback>MP</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">MyPass</div>
                    <div className="text-xs text-muted-foreground">avatar fallback</div>
                  </div>
                </div>
              </Example>

              <Example title="Aspect ratio">
                <AspectRatio
                  ratio={16 / 9}
                  className="bg-muted rounded-lg relative overflow-hidden"
                >
                  <Image
                    src="/vercel.svg"
                    alt="Example"
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 768px) 100vw, 640px"
                    priority={false}
                  />
                </AspectRatio>
              </Example>

              <Example title="Accordion">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is MyPass?</AccordionTrigger>
                    <AccordionContent>
                      A studio + booking experience built with shadcn/ui.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Can I customize it?</AccordionTrigger>
                    <AccordionContent>
                      Yes, this is the branding page.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Example>

              <Example title="Collapsible">
                <Collapsible
                  open={isCollapsibleOpen}
                  onOpenChange={setIsCollapsibleOpen}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Details</div>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        Toggle
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-3 text-sm text-muted-foreground">
                    Collapsible content goes here.
                  </CollapsibleContent>
                </Collapsible>
              </Example>

              <Example title="Tooltip">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>Tooltip content</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Example>

              <Example title="Dropdown menu">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Plus className="mr-2 h-4 w-4" />
                      New
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MoreHorizontal className="mr-2 h-4 w-4" />
                      More
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Example>

              <Example title="Dialog">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog title</DialogTitle>
                      <DialogDescription>
                        This is a dialog description.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Example>

              <Example title="Alert dialog">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Open alert dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Allow connection?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Do you want to allow this accessory to connect?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>
                        <BluetoothIcon className="mr-2 h-4 w-4" />
                        Allow
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Example>

              <Example title="Sheet">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Sheet title</SheetTitle>
                      <SheetDescription>
                        Side panel content goes here.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-3">
                      <Input placeholder="Type…" />
                      <Button className="w-full">Continue</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </Example>

              <Example title="Breadcrumb" containerClassName="md:col-span-2">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <a className="transition-colors hover:text-foreground" href="#">
                        Studio
                      </a>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>Branding</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </Example>

              <Example title="CTA Button">
                <CtaButton>Get started</CtaButton>
              </Example>

              <Example title="Sidebar (contained demo)">
                <SidebarProvider defaultOpen>
                  <div className="w-full max-w-sm rounded-xl border bg-sidebar p-2 text-sidebar-foreground">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive>Overview</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>Catalog</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>Settings</SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>

                    <div className="mt-3">
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton isActive>
                            Classes
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>Plans</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>Coupons</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </div>
                  </div>
                </SidebarProvider>
              </Example>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="grid gap-8 md:grid-cols-2">
              <Example title="Date Selector" containerClassName="md:col-span-2">
                <DateSelectorExample />
              </Example>

              <Example title="Class List" containerClassName="md:col-span-2">
                <ClassListExample />
              </Example>

              <Example title="Bundle Card" containerClassName="md:col-span-2">
                <BundleCardExample />
              </Example>

              <Example title="Animated Tabs" containerClassName="md:col-span-2">
              </Example>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ExampleWrapper>
  )
}

// Example components for showcase
function DateSelectorExample() {
  const [selectedDate, setSelectedDate] = React.useState<number>(1)

  const sampleDates: DateItem[] = [
    {
      day: "Mon",
      date: 29,
      displayDate: "29",
      status: "slots",
      available: true,
      slotCount: 2,
    },
    {
      day: "Tue",
      date: 30,
      displayDate: "30",
      status: "Unavailable",
      available: false,
    },
    {
      day: "Wed",
      date: 1,
      displayDate: "1",
      status: "slots",
      available: true,
      slotCount: 2,
    },
    {
      day: "Thu",
      date: 2,
      displayDate: "2",
      status: "slots",
      available: true,
      slotCount: 2,
    },
    {
      day: "Fri",
      date: 3,
      displayDate: "3",
      status: "slots",
      available: true,
      slotCount: 2,
    },
    {
      day: "Sat",
      date: 4,
      displayDate: "4",
      status: "Unavailable",
      available: false,
    },
    {
      day: "Sun",
      date: 5,
      displayDate: "5",
      status: "Unavailable",
      available: false,
    },
  ]

  return (
    <DateSelector
      dates={sampleDates}
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
    />
  )
}

function ClassListExample() {
  const sampleClasses: ClassSession[] = [
    {
      id: "1",
      name: "Реформер",
      time: "09:00 - 10:00",
      location: "Flow Pilates",
      spots: "0/20",
      available: true,
    },
    {
      id: "2",
      name: "Mat Pilates",
      time: "17:00 - 18:00",
      location: "Flow Pilates",
      spots: "5/20",
      available: true,
    },
  ]

  return (
    <ClassList
      classes={sampleClasses}
      onBook={(classItem) => {
        console.log("Book:", classItem)
      }}
    />
  )
}

function BundleCardExample() {
  return (
    <div className="space-y-3 md:space-y-4">
      <BundleCard
        image="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Images/jared-rice-8w7b4SdhOgw-unsplash.jpg"
        imageAlt="Monthly subscription"
        title="Сар бүрийн гишүүнчлэл"
        price="€80.00 сар бүр"
        description="Бүх йога хичээл. Сар бүр төлбөр авна. Хүссэн үедээ цуцлах боломжтой."
        onSelect={() => {
          console.log("Selected monthly subscription")
        }}
      />
      <BundleCard
        image="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Images/jared-rice-8w7b4SdhOgw-unsplash.jpg"
        imageAlt="10 Group sessions"
        title="10 Бүлгийн хичээл"
        price="€150.00"
        description="10 удаагийн бүлгийн хичээл. 6 сарын хугацаанд хэрэглэх боломжтой."
        onSelect={() => {
          console.log("Selected 10 group sessions")
        }}
      />
    </div>
  )
}